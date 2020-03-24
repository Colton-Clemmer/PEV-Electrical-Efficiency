const prompt = require('prompt')
const colors = require('colors/safe')
const jsonfile = require('jsonfile')
const _ = require('lodash')
const { addRecord, setup, viewRecords } = require('./fns')

prompt.start()

prompt.message = ''
prompt.delimiter = colors.cyan(' >')


let records = []
let averageEff = 0
try {
    records = jsonfile.readFileSync('./records.dat').records
    averageEff = Math.round(_.mean(_.map(records, ({ whPerMile }) => whPerMile)))
} catch (e) { }

const loop = (setupData, done) => {
    console.log(`\n\n\n\n\n    
***************************
    Longboard Stats
***************************
    Battery:            ${colors.yellow(setupData.capacity + ' wh')}
    Max Charge:         ${colors.green(setupData.maxCharge + ' v')}
    Lowest Charge:      ${colors.red(setupData.lowCharge + ' v')}
    Average wh/mi:       ${colors.cyan(averageEff + 'wh/mi')}
    \n\n
1. Change Setup
2. Add Record
3. View Records
4. Quit
    `)
    
    prompt.get(['Choice'], (err, { Choice }) => {
        switch (parseInt(Choice)) {
            case 1:
                setup(done)
                break
            case 2:
                addRecord(setupData, done)
                break
            case 3:
                viewRecords(done)
                break
            case 4:
                process.exit(1)
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
