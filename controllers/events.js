const EventModel = require('../models/Event')

const create = async (req, res) => {  

  const { title, startDate, endDate, repeat, customRepeat, repeatEnds, type, link, description} = req.body;

  try {
    const doc = new EventModel({
      title: title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      repeat: repeat,
      customRepeat: customRepeat,
      repeatEnds: repeatEnds,
      type: req.body.type,
      link: req.body.link,
      address: req.body.address,
      description: req.body.description,
      user: req.userId,
    })

    if (repeat === 'none') { 
      await doc.save();
      res.status(201).json({ message: 'Event created successfully' });
    } else { 
      await generateRepeatingEvents(doc);
      res.status(201).json({ message: 'Event created successfully' });
    } 
 
  } catch (error) {   
    res.status(500).json({ message: 'Failed to create event' });
  }
}

const update = async (req, res) => {
  try {
    const event = await EventModel.findByIdAndUpdate(
      { _id: req.params.id }, 
      { $set: req.body }, 
      { new: true });

    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.status(200).json({ message: "Event updated successfully", data: event });
  } catch (error) { 
    res.status(500).json({ message: "Failed to update event" });
  }
}

const getUpcoming = async (req, res) => {
  try {
    let query = { startDate: { $gte: new Date() }, user: req.userId };

    const events = await EventModel.find(query).sort({ startDate: 1 }).limit(5); 
    res.status(200).json(events);

  } catch (error) { 
    res.status(500).json({ message: "Failed to get events" });
  }
}

const getAll = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate); 

    let query = { startDate: { $gte: startDate }, endDate: {  $lte: endDate }, user: req.userId }; 

    const events = await EventModel.find(query); 
    res.status(200).json({ message: 'Events retrieved successfully', data: events });

  } catch (error) {  
    res.status(500).json({ message: "Failed to get events" });
  }
}
 
const getOne = async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event retrieved successfully', data: event });

  } catch (error) {
    res.status(500).json({ message: "Failed to get event" });
  }
}
 
const remove = async (req, res) => { 
  try {   
    if (req.query.current === 'false') { 
      const { title } = await EventModel.findById(req.params.id);

      if (!title) {
        return res.status(404).json({ message: 'Event not found' });
      }

      await EventModel.deleteMany({ title, user: req.userId });

      res.status(200).json({ message: 'Repeated events have been successfully removed!' });
    } else { 
      const event = await EventModel.findByIdAndDelete(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.status(200).json({ message: 'Event has been successfully removed!' });

    }

  } catch (error) { 
    res.status(500).json({ message: "Failed to remove event" });
  }
}

const generateRepeatingEvents = async (event) => {
  try {
    const { repeat, customRepeat, repeatEnds, startDate, endDate } = event;

    const startRepeating = new Date(startDate);
    const endRepeating = new Date(repeatEnds); 
     
    let interval, unit;
    if (repeat === 'custom') {
      interval = customRepeat.interval;
      unit = customRepeat.unit;
    }
 
    let currentDateStart = new Date(startRepeating);
    let currentDateEnd = new Date(endDate);

    let updatedEventStartDate = new Date(startDate)
    let updatedEventEndDate = new Date(endDate)
   

    while (currentDateStart <= endRepeating) {
      const repeatedEvent = new EventModel({
        title: event.title,
        startDate: currentDateStart,
        endDate: currentDateEnd,
        user: event.user, 
      });

      if((repeat == 'custom' && unit !== "weeks") || (repeat != 'custom' && unit !== "weeks")){
        await repeatedEvent.save(); 
      }
 
      switch (repeat) {
        case 'daily':
          currentDateStart.setDate(currentDateStart.getDate() + 1);
          currentDateEnd.setDate(currentDateEnd.getDate() + 1);
          break;
        case 'weekly': 
          currentDateStart.setDate(currentDateStart.getDate() + 7);
          currentDateEnd.setDate(currentDateEnd.getDate() + 7); 
          break;
        case 'monthly':
          currentDateStart.setMonth(currentDateStart.getMonth() + 1);
          currentDateEnd.setMonth(currentDateEnd.getMonth() + 1);
          break;
        case 'yearly':
          currentDateStart.setFullYear(currentDateStart.getFullYear() + 1);
          currentDateEnd.setFullYear(currentDateEnd.getFullYear() + 1);
          break;
        case 'custom':
          switch (unit) {
            case 'days':
              currentDateStart.setDate(currentDateStart.getDate() + interval);
              currentDateEnd.setDate(currentDateEnd.getDate() + interval);
              break;
            case 'weeks':
              let some = 0; 
              const selectedDays = customRepeat.days; 
              const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

              let day = currentDateStart.getUTCDay(); 
              let currentWeekStart = new Date(currentDateStart.getTime() - ((day === 0 ? 6 : day - 1) * 24 * 60 * 60 * 1000));
              let currentWeekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
 
              
              for (let currentDate = new Date(currentWeekStart); currentDate <= currentWeekEnd; currentDate.setDate(currentDate.getDate() + 1)) {
               
                let currentWeekDay = currentDate.getUTCDay();
                let currentWeekDayName = weekDays[(currentWeekDay === 0 ? 6 : currentWeekDay - 1)];

                if(currentDate >= startDate && currentDate <= repeatEnds){  
                  if(selectedDays.includes(currentWeekDayName)){  

                    let updatedStartNumb = updatedEventStartDate.getUTCDay(); 
                    let updatedStartWeek = new Date(updatedEventStartDate.getTime() - ((updatedStartNumb === 0 ? 6 : updatedStartNumb - 1) * 24 * 60 * 60 * 1000));
                    let updatedEndNumb = updatedEventEndDate.getUTCDay(); 
                    let updatedEndWeek = new Date(updatedEventEndDate.getTime() - ((updatedEndNumb === 0 ? 6 : updatedEndNumb - 1) * 24 * 60 * 60 * 1000));
                    
                    updatedStartWeek.setDate(updatedStartWeek.getDate() + some )
                    updatedEndWeek.setDate(updatedEndWeek.getDate() + some ) 
                    
                    const eventOfDays = new EventModel({
                      title: event.title,
                      startDate: new Date(updatedStartWeek),
                      endDate: new Date(updatedEndWeek),
                      user: event.user,
                    });
                    
                    await eventOfDays.save();  
                  } 

                }
                some++; 
              }
              updatedEventStartDate.setDate(updatedEventStartDate.getDate() + interval * 7);
              updatedEventEndDate.setDate(updatedEventEndDate.getDate() + interval * 7);
              
              
              currentDateStart.setDate(currentDateStart.getDate() + interval * 7);
              currentDateEnd.setDate(currentDateEnd.getDate() + interval * 7);
              break;
            case 'months':
              currentDateStart.setMonth(currentDateStart.getMonth() + interval);
              currentDateEnd.setMonth(currentDateEnd.getMonth() + interval);
              break;
            case 'years':
              currentDateStart.setFullYear(currentDateStart.getFullYear() + interval);
              currentDateEnd.setFullYear(currentDateEnd.getFullYear() + interval);
              break;
          }
          break;
      }
      
    }
  } catch (error) {
    console.error('Error generating repeating events: ', error);
  }
};


module.exports = { create, update, remove, getOne, getAll, getUpcoming };