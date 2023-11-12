module.exports = (req,res,next) => {
    const date = req.body.date

    const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(date)
    
    if(!isValidDateFormat){
        return res.status(400).json({
            message: "Invalid date format. Please provide date in YYYY-MM-DD format."
        })
    }

    const newDate = new Date(date)
    const today = new Date()
    today.setUTCHours(0,0,0,0)

    if(today>newDate){
        return res.status(400).json({
            message: "Please provide a date in the future"
        })
    }

    next()
}