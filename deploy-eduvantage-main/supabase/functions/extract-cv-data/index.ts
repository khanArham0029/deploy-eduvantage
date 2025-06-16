import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ExtractedData {
  full_name?: string
  field_of_study?: string
  degree_level?: string
  gpa?: number
  skills?: string[]
  experience?: string[]
  education?: string[]
  languages?: string[]
  certifications?: string[]
  email?: string
  phone?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing CV extraction request...')
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('No file provided in request')
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`)

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      console.error(`Unsupported file type: ${file.type}`)
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error(`File too large: ${file.size} bytes`)
      return new Response(
        JSON.stringify({ error: 'File size too large. Maximum size is 5MB.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let extractedText = ''

    // Extract text based on file type
    if (file.type === 'text/plain') {
      console.log('Processing text file...')
      extractedText = await file.text()
    } else if (file.type === 'application/pdf' || 
               file.type === 'application/msword' || 
               file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      
      console.log('Sending file to external PDF parser...')
      
      // Forward the file to your microservice
      const forwardForm = new FormData()
      forwardForm.append("file", file) // forward the original file

      const res = await fetch("https://micro-service-eduvantage-ov85.onrender.com/extract-text", {
        method: "POST",
        body: forwardForm,
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error("Failed to parse file remotely:", errorText)
        throw new Error(`Remote file parsing failed: ${res.status} - ${errorText}`)
      }
      
      const result = await res.json()
      extractedText = result.text || ''
      
      console.log(`Successfully extracted text from microservice. Length: ${extractedText.length}`)
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the file. Please ensure the file contains readable text.')
      }
    } else {
      throw new Error('Unsupported file type for processing')
    }

    console.log(`Final extracted text length: ${extractedText.length}`)
    console.log(`First 200 chars: ${extractedText.substring(0, 200)}`)

    // Parse the extracted text to get structured data
    const parsedData = parseExtractedText(extractedText)
    
    console.log('Parsed data:', JSON.stringify(parsedData, null, 2))

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedData,
        debug: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          extractedTextLength: extractedText.length,
          extractedTextPreview: extractedText.substring(0, 300),
          microserviceUsed: file.type !== 'text/plain'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing CV:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process CV file',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function parseExtractedText(text: string): ExtractedData {
  const data: ExtractedData = {}
  const lowerText = text.toLowerCase()
  
  console.log('Starting text parsing...')
  
  // Extract name (look for patterns at the beginning of the document)
  const namePatterns = [
    /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/m,
    /name:?\s*([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    /^([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)/m,
    // Additional patterns for different CV formats
    /^\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*$/m,
    /^([A-Z][A-Z\s]+)(?:\n|$)/m
  ]
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].length > 3 && match[1].length < 50) {
      // Clean up the name (remove extra spaces, convert to proper case)
      let name = match[1].trim()
      if (name === name.toUpperCase()) {
        // Convert ALL CAPS to proper case
        name = name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      }
      data.full_name = name
      console.log(`Found name: ${data.full_name}`)
      break
    }
  }

  // Extract email with improved patterns
  const emailPatterns = [
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /email:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /e-mail:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  ]
  
  for (const pattern of emailPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      data.email = match[1].toLowerCase()
      console.log(`Found email: ${data.email}`)
      break
    }
  }

  // Extract phone with improved patterns
  const phonePatterns = [
    /(?:phone|tel|mobile|cell):?\s*(\+?[0-9\s\-\(\)\.]{10,})/gi,
    /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g,
    /(\+?[0-9]{1,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4})/g
  ]
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      data.phone = match[1].trim()
      console.log(`Found phone: ${data.phone}`)
      break
    }
  }

  // Extract GPA with more comprehensive patterns
  const gpaPatterns = [
    /gpa:?\s*(\d+\.?\d*)\s*\/?\s*4\.?0?/gi,
    /grade point average:?\s*(\d+\.?\d*)/gi,
    /cgpa:?\s*(\d+\.?\d*)/gi,
    /cumulative gpa:?\s*(\d+\.?\d*)/gi,
    /overall gpa:?\s*(\d+\.?\d*)/gi,
    /(\d+\.\d+)\s*\/\s*4\.0/gi,
    /(\d+\.\d+)\s*gpa/gi
  ]
  
  for (const pattern of gpaPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const gpa = parseFloat(match[1])
      if (gpa >= 0 && gpa <= 4.0) {
        data.gpa = gpa
        console.log(`Found GPA: ${data.gpa}`)
        break
      }
    }
  }

  // Extract education level with improved patterns
  const educationPatterns = [
    { pattern: /master(?:'?s)?(?:\s+of|\s+in|\s+degree)?(?:\s+science|\s+arts|\s+engineering|\s+business)?/gi, level: 'Masters' },
    { pattern: /m\.?s\.?(?:\s+in)?/gi, level: 'Masters' },
    { pattern: /m\.?a\.?(?:\s+in)?/gi, level: 'Masters' },
    { pattern: /msc(?:\s+in)?/gi, level: 'Masters' },
    { pattern: /mba(?:\s+in)?/gi, level: 'Masters' },
    { pattern: /phd|ph\.d|doctorate|doctoral/gi, level: 'PhD' },
    { pattern: /bachelor(?:'?s)?(?:\s+of|\s+in|\s+degree)?(?:\s+science|\s+arts|\s+engineering)?/gi, level: 'Bachelors' },
    { pattern: /b\.?s\.?(?:\s+in)?/gi, level: 'Bachelors' },
    { pattern: /b\.?a\.?(?:\s+in)?/gi, level: 'Bachelors' },
    { pattern: /bsc(?:\s+in)?/gi, level: 'Bachelors' },
    { pattern: /undergraduate/gi, level: 'Bachelors' }
  ]
  
  for (const { pattern, level } of educationPatterns) {
    if (text.match(pattern)) {
      data.degree_level = level
      console.log(`Found degree level: ${data.degree_level}`)
      break
    }
  }

  // Extract field of study with comprehensive patterns
  const fieldPatterns = [
    /(?:master|bachelor|degree|major|phd|ph\.d)(?:'?s)?\s+(?:of|in)\s+([^,\n\.]+)/gi,
    /(?:computer science|data science|software engineering|information technology|artificial intelligence|machine learning)/gi,
    /(?:mechanical engineering|electrical engineering|civil engineering|chemical engineering|biomedical engineering)/gi,
    /(?:business administration|management|finance|accounting|marketing|economics)/gi,
    /(?:medicine|medical|nursing|pharmacy|dentistry|veterinary)/gi,
    /(?:law|legal studies|jurisprudence)/gi,
    /(?:psychology|sociology|anthropology|political science|international relations)/gi,
    /(?:biology|chemistry|physics|mathematics|statistics)/gi,
    /(?:education|teaching|pedagogy)/gi,
    /(?:arts|design|fine arts|graphic design|architecture)/gi
  ]
  
  for (const pattern of fieldPatterns) {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length > 0) {
      let field = matches[0][1] || matches[0][0]
      field = field.replace(/(?:master|bachelor|degree|major|phd|ph\.d)(?:'?s)?\s+(?:of|in)\s+/gi, '').trim()
      if (field.length > 3 && field.length < 100) {
        data.field_of_study = field.charAt(0).toUpperCase() + field.slice(1).toLowerCase()
        console.log(`Found field of study: ${data.field_of_study}`)
        break
      }
    }
  }

  // Extract skills with comprehensive technology list
  const skillsSection = text.match(/(?:skills?|technical skills?|competencies|programming|technologies|tools)[\s\S]*?(?=\n[A-Z][A-Z]|\n\n|languages|experience|education|projects|$)/gi)
  if (skillsSection && skillsSection.length > 0) {
    const skillsText = skillsSection[0]
    const skills = new Set<string>()
    
    // Comprehensive list of technical skills
    const techSkills = [
      // Programming Languages
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'Scala', 'R', 'Swift', 'Kotlin', 'Dart',
      'C', 'Objective-C', 'Perl', 'Haskell', 'Clojure', 'F#', 'VB.NET', 'COBOL', 'Fortran', 'Assembly',
      
      // Web Technologies
      'HTML', 'CSS', 'SCSS', 'SASS', 'Less', 'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Chakra UI',
      'React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby', 'Ember.js',
      'Node.js', 'Express.js', 'Koa.js', 'Fastify', 'NestJS',
      
      // Mobile Development
      'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova', 'PhoneGap',
      
      // Backend Frameworks
      'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Spring', 'Hibernate', 'Struts',
      'Ruby on Rails', 'Sinatra', 'Laravel', 'Symfony', 'CodeIgniter',
      'ASP.NET', '.NET Core', 'Entity Framework',
      
      // Databases
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'CouchDB',
      'Oracle', 'SQL Server', 'SQLite', 'MariaDB', 'Neo4j', 'InfluxDB', 'Elasticsearch',
      
      // Cloud Platforms
      'AWS', 'Azure', 'Google Cloud', 'GCP', 'IBM Cloud', 'Oracle Cloud', 'DigitalOcean', 'Heroku', 'Vercel', 'Netlify',
      
      // DevOps & Tools
      'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI',
      'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant', 'Helm',
      'Git', 'SVN', 'Mercurial', 'Perforce',
      
      // Data Science & ML
      'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
      'Jupyter', 'Apache Spark', 'Hadoop', 'Kafka', 'Airflow', 'MLflow', 'Kubeflow',
      'Tableau', 'Power BI', 'D3.js', 'Plotly',
      
      // Testing
      'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Puppeteer', 'Playwright',
      'JUnit', 'TestNG', 'Mockito', 'RSpec', 'PHPUnit',
      
      // Other Technologies
      'GraphQL', 'REST API', 'SOAP', 'gRPC', 'WebSocket', 'Socket.io',
      'Microservices', 'Serverless', 'Lambda', 'API Gateway',
      'Blockchain', 'Ethereum', 'Solidity', 'Web3',
      'Unity', 'Unreal Engine', 'Blender', 'Maya', 'Photoshop', 'Illustrator'
    ]
    
    for (const skill of techSkills) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      if (skillsText.match(regex)) {
        skills.add(skill)
      }
    }
    
    if (skills.size > 0) {
      data.skills = Array.from(skills).slice(0, 15) // Limit to 15 skills
      console.log(`Found skills: ${data.skills.join(', ')}`)
    }
  }

  // Extract languages with improved patterns
  const languageSection = text.match(/(?:languages?|language proficiency|linguistic skills)[\s\S]*?(?=\n[A-Z][A-Z]|\n\n|skills|experience|education|projects|$)/gi)
  if (languageSection && languageSection.length > 0) {
    const langText = languageSection[0]
    const languages = new Set<string>()
    
    const commonLanguages = [
      'English', 'Spanish', 'French', 'German', 'Chinese', 'Mandarin', 'Cantonese', 'Japanese', 'Korean',
      'Arabic', 'Portuguese', 'Italian', 'Russian', 'Hindi', 'Dutch', 'Swedish', 'Norwegian', 'Danish',
      'Finnish', 'Polish', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Croatian', 'Serbian',
      'Greek', 'Turkish', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Tagalog'
    ]
    
    for (const lang of commonLanguages) {
      const patterns = [
        new RegExp(`${lang}\\s*\\([^)]+\\)`, 'gi'),
        new RegExp(`${lang}\\s*[-:]\\s*[^,\\n]+`, 'gi'),
        new RegExp(`\\b${lang}\\b`, 'gi')
      ]
      
      for (const pattern of patterns) {
        const match = langText.match(pattern)
        if (match) {
          languages.add(match[0].trim())
          break
        }
      }
    }
    
    if (languages.size > 0) {
      data.languages = Array.from(languages).slice(0, 8) // Limit to 8 languages
      console.log(`Found languages: ${data.languages.join(', ')}`)
    }
  }

  // Extract experience with improved patterns
  const experienceSection = text.match(/(?:experience|work experience|employment|professional experience|career history)[\s\S]*?(?=education|skills|languages|projects|$)/gi)
  if (experienceSection && experienceSection.length > 0) {
    const expText = experienceSection[0]
    const experiences = []
    
    // Split by lines and filter for job titles/companies
    const lines = expText.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length > 20 && trimmed.length < 200) {
        // Look for job titles, companies, or date ranges
        if (/(?:engineer|developer|scientist|manager|analyst|consultant|director|coordinator|specialist|intern|associate|senior|junior|lead)/gi.test(trimmed) ||
            /(?:inc|corp|ltd|llc|company|university|institute|organization)/gi.test(trimmed) ||
            /\d{4}/.test(trimmed)) {
          experiences.push(trimmed)
        }
      }
    }
    
    if (experiences.length > 0) {
      data.experience = experiences.slice(0, 5) // Limit to 5 experiences
      console.log(`Found experience: ${data.experience.length} entries`)
    }
  }

  // Extract education with improved patterns
  const educationSection = text.match(/(?:education|academic background|academic qualifications|academic history)[\s\S]*?(?=experience|skills|languages|projects|$)/gi)
  if (educationSection && educationSection.length > 0) {
    const eduText = educationSection[0]
    const education = []
    
    const lines = eduText.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length > 20 && trimmed.length < 200) {
        // Look for universities, degrees, or graduation years
        if (/(?:university|college|institute|school|academy)/gi.test(trimmed) ||
            /(?:bachelor|master|phd|degree|diploma|certificate)/gi.test(trimmed) ||
            /(?:gpa|grade)/gi.test(trimmed) ||
            /\d{4}/.test(trimmed)) {
          education.push(trimmed)
        }
      }
    }
    
    if (education.length > 0) {
      data.education = education.slice(0, 5) // Limit to 5 education entries
      console.log(`Found education: ${data.education.length} entries`)
    }
  }

  // Extract certifications
  const certificationSection = text.match(/(?:certifications?|certificates?|credentials?|licenses?)[\s\S]*?(?=\n[A-Z][A-Z]|\n\n|skills|experience|education|$)/gi)
  if (certificationSection && certificationSection.length > 0) {
    const certText = certificationSection[0]
    const certifications = []
    
    const lines = certText.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length > 10 && trimmed.length < 150) {
        // Look for certification names
        if (/(?:certified|certification|certificate|aws|azure|google|microsoft|oracle|cisco|comptia|pmp|scrum|agile)/gi.test(trimmed)) {
          certifications.push(trimmed)
        }
      }
    }
    
    if (certifications.length > 0) {
      data.certifications = certifications.slice(0, 5) // Limit to 5 certifications
      console.log(`Found certifications: ${data.certifications.length} entries`)
    }
  }

  console.log('Parsing complete. Final data:', JSON.stringify(data, null, 2))
  return data
}