const prompt = require('prompt')
const colors = require('colors/safe')
const jsonfile = require('jsonfile')
const _ = require('lodash')

addRecord = (setupData, done) => {
    console.log(colors.green('\n\nAdding new record...\n'))
    prompt.get(['Miles', 'Ending Voltage'], (err, { Miles, 'Ending Voltage': eVoltage }) => {
        const percentUsed = (setupData.maxCharge - parseFloat(eVoltage)) / (setupData.maxCharge - setupData.lowCharge)
        const whUsed = setupData.capacity * percentUsed
        const miles = parseFloat(Miles)
        const whPerMile = whUsed / miles
        const milesPerWh = Miles / whUsed
        const date = (new Date()).toISOString()
        console.log(colors.green('\n\nRecord added successfully\n'))
        console.log(colors.white('Date: ') + colors.red(date))
        console.log(colors.white('Percent Used: ' + colors.cyan(Math.round(percentUsed * 100) + '%')))
        console.log(colors.white('Wh Used: ') + colors.green(Math.round(whUsed) + ' wh'));
        console.log(colors.white('Efficiency: ') + colors.green(Math.round(whPerMile) + ' wh/mi') + ' ' + colors.yellow(Math.round(milesPerWh * 1000) + ' mi/kwh'))
        let records
        try {
            records = jsonfile.readFileSync('./records.dat')
        } catch (e) { }
        if (!records) records = { records: [] }
        records.records.push({
            date,
            miles,
            sVoltage: setupData.maxCharge,
            eVoltage: parseFloat(eVoltage),
            whUsed, whPerMile, milesPerWh
        })
        jsonfile.writeFileSync('./records.dat', records)
        done()
    })
}

setup = (done) => prompt.get(['Capacity (wh)', 'Max Charge (v)', 'Lowest Charge  (v)'], (err, { 'Capacity (wh)': capacity, 'Max Charge (v)': maxCharge, 'Lowest Charge  (v)': lowCharge }) => {
    jsonfile.writeFileSync('./setup.dat', { capacity, maxCharge, lowCharge })
    done()
})

viewRecords = (done) => {
    console.log(`
******************
-----records------
******************
    `)
    let records
    try {
        records = jsonfile.readFileSync('./records.dat')
    } catch (e) { }
    if (!records) records = { records: [] }
    records = records.records
    _.each(records, (r) => console.log(`\n\n
***********************************

${colors.white('Date:')}                ${colors.green(r.date)}
${colors.white('Miles:')}               ${colors.yellow(r.miles + ' mi')}
${colors.white('Starting Voltage:')}    ${colors.green(r.sVoltage + ' v')}
${colors.white('Ending Voltage:')}      ${colors.red(r.eVoltage + ' v')}
${colors.white('Energy Used:')}         ${colors.blue(Math.round(r.whUsed) + ' wh')}
${colors.white('Efficiency:')}          ${colors.cyan(Math.round(r.whPerMile) + ' wh/mi')}

***********************************
    `))
    done()
}

module.exports = { addRecord, setup, viewRecords } 