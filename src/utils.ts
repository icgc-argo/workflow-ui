import moment from 'moment-timezone';

moment.updateLocale('en', {
    invalidDate: "N/A"
})

export const parseEpochToEST = (milli: string) => moment(parseInt(milli)).tz('America/Toronto').format('MMMM Do YYYY, h:mm:ss a')
