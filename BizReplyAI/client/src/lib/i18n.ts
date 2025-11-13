// Multi-language support for English and Arabic
export const translations = {
  en: {
    // Auth
    loginTitle: "Break Scheduling System",
    loginSubtitle: "Manage your breaks efficiently",
    loginAsEmployee: "Login as Employee",
    loginAsAdmin: "Login as Admin",
    logout: "Logout",
    
    // Navigation
    dashboard: "Dashboard",
    departments: "Departments",
    schedule: "Schedule",
    myBreaks: "My Breaks",
    employees: "Employees",
    settings: "Settings",
    
    // Break booking
    bookBreak: "Book Break",
    firstBreak: "First Break",
    secondBreak: "Second Break",
    thirdBreak: "Third Break",
    minutes: "minutes",
    min: "min",
    selectTimeSlot: "Select Time Slot",
    breakBooked: "Break Booked",
    breakLocked: "Break Locked",
    breakCompleted: "Break Completed",
    breakUnavailable: "Break Unavailable",
    
    // Time restrictions
    noBreakFirstHour: "No breaks allowed in first hour",
    noBreakLastHour: "No breaks allowed in last hour",
    mustTakeFirstBreak: "You must take the first break (15 min) before the second break",
    availableSlots: "Available Slots",
    of: "of",
    
    // Department
    departmentName: "Department Name",
    maxConcurrentBreaks: "Max Concurrent Breaks",
    shiftPattern: "Shift Pattern",
    addDepartment: "Add Department",
    editDepartment: "Edit Department",
    
    // Shift
    currentShift: "Current Shift",
    shiftTime: "Shift Time",
    to: "to",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    loading: "Loading",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    
    // Messages
    breakBookedSuccess: "Break booked successfully",
    breakCancelledSuccess: "Break cancelled successfully",
    errorBookingBreak: "Error booking break",
    
    // Empty states
    noBreaksScheduled: "No breaks scheduled",
    noDepartments: "No departments found",
    noEmployees: "No employees found",
  },
  ar: {
    // Auth
    loginTitle: "نظام جدولة فترات الراحة",
    loginSubtitle: "إدارة فترات الراحة بكفاءة",
    loginAsEmployee: "تسجيل الدخول كموظف",
    loginAsAdmin: "تسجيل الدخول كمسؤول",
    logout: "تسجيل الخروج",
    
    // Navigation
    dashboard: "لوحة التحكم",
    departments: "الأقسام",
    schedule: "الجدول",
    myBreaks: "فترات الراحة",
    employees: "الموظفون",
    settings: "الإعدادات",
    
    // Break booking
    bookBreak: "حجز فترة راحة",
    firstBreak: "الراحة الأولى",
    secondBreak: "الراحة الثانية",
    thirdBreak: "الراحة الثالثة",
    minutes: "دقيقة",
    min: "د",
    selectTimeSlot: "اختر الوقت",
    breakBooked: "تم الحجز",
    breakLocked: "مقفل",
    breakCompleted: "مكتمل",
    breakUnavailable: "غير متاح",
    
    // Time restrictions
    noBreakFirstHour: "لا يسمح بالراحة في الساعة الأولى",
    noBreakLastHour: "لا يسمح بالراحة في الساعة الأخيرة",
    mustTakeFirstBreak: "يجب أخذ الراحة الأولى (15 دقيقة) قبل الراحة الثانية",
    availableSlots: "الأوقات المتاحة",
    of: "من",
    
    // Department
    departmentName: "اسم القسم",
    maxConcurrentBreaks: "الحد الأقصى للراحات المتزامنة",
    shiftPattern: "نمط الوردية",
    addDepartment: "إضافة قسم",
    editDepartment: "تعديل القسم",
    
    // Shift
    currentShift: "الوردية الحالية",
    shiftTime: "وقت الوردية",
    to: "إلى",
    
    // Common
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    loading: "جاري التحميل",
    error: "خطأ",
    success: "نجح",
    confirm: "تأكيد",
    
    // Messages
    breakBookedSuccess: "تم حجز فترة الراحة بنجاح",
    breakCancelledSuccess: "تم إلغاء فترة الراحة بنجاح",
    errorBookingBreak: "خطأ في حجز فترة الراحة",
    
    // Empty states
    noBreaksScheduled: "لا توجد فترات راحة مجدولة",
    noDepartments: "لا توجد أقسام",
    noEmployees: "لا يوجد موظفون",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
