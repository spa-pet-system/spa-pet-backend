import Appointment from '../models/Appointment.js'
import Service from '../models/Service.js'

const addNewAppointment = async (req, res) => {
    try {
        const { user, pet, service, date, timeSlot, status, note, isPaid } = req.body;
    
        if (!user || !pet || !service || !date || !timeSlot) {
          return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc!' });
        }
    
        const newAppointment = await Appointment.create({
          user,
          pet,
          service,
          date,
          timeSlot,
          status,
          note,
          isPaid,
        });
    
        res.status(201).json({ message: 'Đã tạo lịch hẹn!', data: newAppointment });
      } catch (err) {
        console.error('Tạo appointment lỗi:', err);
        res.status(500).json({ message: 'Lỗi server khi tạo lịch hẹn' });
      }
}

const countBySlot = async (req, res) => {
    try {
        const { serviceId, date } = req.query; // Ex: "2025-07-19"
        const service = await Service.findById(serviceId)
    
        if (!serviceId || !date) {
          return res.status(400).json({ message: "Missing serviceId or date" });
        }
    
        // Chuẩn hóa ngày bắt đầu/kết thúc (để tìm đúng 1 ngày)
        const dayStart = new Date(date + "T00:00:00.000Z");
        const nextDay = new Date(dayStart);
        nextDay.setDate(nextDay.getDate() + 1);
    
        // Lấy danh sách Appointment đã confirmed trong ngày đó và service đó
        const appointments = await Appointment.find({
          service: serviceId,
          status: "confirmed",
          date: { $gte: dayStart, $lt: nextDay }
        });
    
        // Tạo object đếm slot
        // Nếu bạn có list slot cố định, hãy liệt kê ra để đảm bảo có cả slot 0 booking
        const timeSlots = service.timeSlots // slot cố định cho service này
        const count = {};
        timeSlots.forEach(slot => count[slot] = 0); // init = 0
    
        // Đếm từng slot
        appointments.forEach(app => {
          if (count[app.timeSlot] !== undefined) {
            count[app.timeSlot]++;
          }
        });
    
        res.json(count);
    
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
}   

export const appointmentController = {
    countBySlot,
    addNewAppointment
}