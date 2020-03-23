const prompt = require('prompt')
const colors = require('colors/safe')
const jsonfile = require('jsonfile')
const { addRecord, setup } = require('./fns')

prompt.start()

prompt.message = ''
prompt.delimiter = colors.cyan(' >')


const loop = (setupData, done) => {
    console.log(`\n\n\n\n\n    
***************************
    Longboard Stats
***************************
    Battery:            ${colors.yellow(setupData.capacity + ' wh')}
    Max Charge:         ${colors.green(setupData.maxCharge + ' v')}
    Lowest Charge:      ${colors.red(setupData.lowCharge + ' v')}
1. Change Setup
2. Add Record
    `)
    
    prompt.get(['Choice'], (err, { Choice }) => {
        const c = parseInt(Choice) === 1
        if (c) {
            setup(done)
        } else {
            addRecord(setupData, done)
        }
    })
}

const getSetup = () => {
    try {
        const setupData = jsonfile.readFileSync('./setup.dat')
        const startLoop = () => (new Promise((res) => loop(setupData, res))).then(() => startLoop())
        startLoop()
    } catch (e) {
        console.log('Setup file not found, proceeding to setup...')
        const p = (new Promise((res) => setup(res))).then(() => getSetup())
    }
}

getSetup()
