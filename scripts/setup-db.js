const { execSync } = require('child_process')
const net = require('net')

const url = process.env.DATABASE_URL || ''
const match = url.match(/mysql:\/\/.+@([^:]+):(\d+)/)

if (!match) {
  console.log('⚠️  No DATABASE_URL found, skipping DB setup')
  process.exit(0)
}

const host = match[1]
const port = parseInt(match[2])

console.log(`🔌 Testing connection to ${host}:${port}...`)

const socket = new net.Socket()
socket.setTimeout(5000)

socket.on('connect', () => {
  console.log('✅ Database reachable! Running setup...')
  socket.destroy()

  try {
    console.log('📦 Running prisma db push...')
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })

    console.log('🌱 Running prisma db seed...')
    execSync('npx prisma db seed', { stdio: 'inherit' })

    console.log('✅ Database setup complete!')
  } catch (err) {
    console.warn('⚠️  DB setup failed (non-fatal):', err.message)
    process.exit(0)
  }
})

socket.on('timeout', () => {
  console.log('⚠️  Database not reachable (timeout), skipping DB setup')
  socket.destroy()
  process.exit(0)
})

socket.on('error', (err) => {
  console.log(`⚠️  Database not reachable (${err.message}), skipping DB setup`)
  socket.destroy()
  process.exit(0)
})

socket.connect(port, host)
