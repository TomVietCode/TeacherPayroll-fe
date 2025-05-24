import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Utility function to export data to Excel
export const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and save file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

// Export multiple sheets to Excel
export const exportMultipleSheetsToExcel = (sheetsData, fileName) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add each sheet
    sheetsData.forEach(({ data, sheetName }) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and save file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting multiple sheets to Excel:', error);
    return false;
  }
};

// Export statistics data with proper formatting
export const exportStatisticsToExcel = (statsByDepartment, statsByDegree, statsByAge) => {
  try {
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('vi-VN');
    const fileName = `Thong_Ke_Giao_Vien_${currentDate.getFullYear()}_${(currentDate.getMonth() + 1).toString().padStart(2, '0')}_${currentDate.getDate().toString().padStart(2, '0')}`;
    
    // Format department data
    const departmentData = statsByDepartment.map((item, index) => ({
      'STT': index + 1,
      'Tên viết tắt': item.shortName,
      'Tên khoa': item.fullName,
      'Số lượng giáo viên': item.count
    }));
    
    // Format degree data
    const degreeData = statsByDegree.map((item, index) => ({
      'STT': index + 1,
      'Tên viết tắt': item.shortName,
      'Tên bằng cấp': item.fullName,
      'Số lượng giáo viên': item.count
    }));
    
    // Format age data
    const ageData = statsByAge.map((item, index) => ({
      'STT': index + 1,
      'Nhóm tuổi': item.label,
      'Số lượng giáo viên': item.count
    }));
    
    // Calculate totals
    const totalByDepartment = statsByDepartment.reduce((sum, item) => sum + item.count, 0);
    const totalByDegree = statsByDegree.reduce((sum, item) => sum + item.count, 0);
    const totalByAge = statsByAge.reduce((sum, item) => sum + item.count, 0);
    
    // Add totals row
    departmentData.push({
      'STT': '',
      'Tên viết tắt': '',
      'Tên khoa': 'TỔNG CỘNG',
      'Số lượng giáo viên': totalByDepartment
    });
    
    degreeData.push({
      'STT': '',
      'Tên viết tắt': '',
      'Tên bằng cấp': 'TỔNG CỘNG',
      'Số lượng giáo viên': totalByDegree
    });
    
    ageData.push({
      'STT': '',
      'Nhóm tuổi': 'TỔNG CỘNG',
      'Số lượng giáo viên': totalByAge
    });
    
    // Create workbook with multiple sheets
    const sheetsData = [
      { data: departmentData, sheetName: 'Thống kê theo khoa' },
      { data: degreeData, sheetName: 'Thống kê theo bằng cấp' },
      { data: ageData, sheetName: 'Thống kê theo độ tuổi' }
    ];
    
    return exportMultipleSheetsToExcel(sheetsData, fileName);
  } catch (error) {
    console.error('Error exporting statistics to Excel:', error);
    return false;
  }
};

// Export single tab statistics data
export const exportSingleStatisticsToExcel = (data, type) => {
  try {
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('vi-VN');
    
    let fileName, formattedData, sheetName;
    
    switch (type) {
      case 'department':
        fileName = `Thong_Ke_Theo_Khoa_${currentDate.getFullYear()}_${(currentDate.getMonth() + 1).toString().padStart(2, '0')}_${currentDate.getDate().toString().padStart(2, '0')}`;
        sheetName = 'Thống kê theo khoa';
        formattedData = data.map((item, index) => ({
          'STT': index + 1,
          'Tên viết tắt': item.shortName,
          'Tên khoa': item.fullName,
          'Số lượng giáo viên': item.count
        }));
        break;
        
      case 'degree':
        fileName = `Thong_Ke_Theo_Bang_Cap_${currentDate.getFullYear()}_${(currentDate.getMonth() + 1).toString().padStart(2, '0')}_${currentDate.getDate().toString().padStart(2, '0')}`;
        sheetName = 'Thống kê theo bằng cấp';
        formattedData = data.map((item, index) => ({
          'STT': index + 1,
          'Tên viết tắt': item.shortName,
          'Tên bằng cấp': item.fullName,
          'Số lượng giáo viên': item.count
        }));
        break;
        
      case 'age':
        fileName = `Thong_Ke_Theo_Do_Tuoi_${currentDate.getFullYear()}_${(currentDate.getMonth() + 1).toString().padStart(2, '0')}_${currentDate.getDate().toString().padStart(2, '0')}`;
        sheetName = 'Thống kê theo độ tuổi';
        formattedData = data.map((item, index) => ({
          'STT': index + 1,
          'Nhóm tuổi': item.label,
          'Số lượng giáo viên': item.count
        }));
        break;
        
      default:
        throw new Error('Invalid statistics type');
    }
    
    // Add total row
    const total = data.reduce((sum, item) => sum + item.count, 0);
    formattedData.push({
      'STT': '',
      ...(type === 'age' ? { 'Nhóm tuổi': 'TỔNG CỘNG' } : { 'Tên viết tắt': '', [type === 'department' ? 'Tên khoa' : 'Tên bằng cấp']: 'TỔNG CỘNG' }),
      'Số lượng giáo viên': total
    });
    
    return exportToExcel(formattedData, fileName, sheetName);
  } catch (error) {
    console.error('Error exporting single statistics to Excel:', error);
    return false;
  }
};

// Export course class statistics
export const exportCourseClassStatisticsToExcel = (data, academicYear, semesterInfo) => {
  try {
    const currentDate = new Date();
    const fileName = `Thong_Ke_Lop_Hoc_Phan_${academicYear.replace('-', '_')}_${currentDate.getFullYear()}_${(currentDate.getMonth() + 1).toString().padStart(2, '0')}_${currentDate.getDate().toString().padStart(2, '0')}`;
    
    // Format course class data
    const formattedData = [];
    
    data.forEach(subjectData => {
      // Add subject header
      formattedData.push({
        'STT': '',
        'Mã học phần': subjectData.subject.code,
        'Tên học phần': subjectData.subject.name,
        'Mã lớp': '',
        'Tên lớp': '',
        'Số sinh viên': '',
        'Ghi chú': 'THÔNG TIN HỌC PHẦN'
      });
      
      // Add classes for this subject
      subjectData.classes.forEach((classData, index) => {
        formattedData.push({
          'STT': index + 1,
          'Mã học phần': '',
          'Tên học phần': '',
          'Mã lớp': classData.code,
          'Tên lớp': classData.name,
          'Số sinh viên': classData.studentCount,
          'Ghi chú': ''
        });
      });
      
      // Add subtotal
      const subtotal = subjectData.classes.reduce((sum, cls) => sum + cls.studentCount, 0);
      formattedData.push({
        'STT': '',
        'Mã học phần': '',
        'Tên học phần': '',
        'Mã lớp': '',
        'Tên lớp': `Tổng cộng ${subjectData.subject.code}`,
        'Số sinh viên': subtotal,
        'Ghi chú': 'TỔNG PHỤ'
      });
      
      // Add empty row for separation
      formattedData.push({
        'STT': '',
        'Mã học phần': '',
        'Tên học phần': '',
        'Mã lớp': '',
        'Tên lớp': '',
        'Số sinh viên': '',
        'Ghi chú': ''
      });
    });
    
    // Add grand total
    const grandTotal = data.reduce((sum, subjectData) => 
      sum + subjectData.classes.reduce((subSum, cls) => subSum + cls.studentCount, 0), 0
    );
    
    formattedData.push({
      'STT': '',
      'Mã học phần': '',
      'Tên học phần': '',
      'Mã lớp': '',
      'Tên lớp': 'TỔNG CỘNG TẤT CẢ',
      'Số sinh viên': grandTotal,
      'Ghi chú': 'TỔNG CUỐI'
    });
    
    const sheetName = `Lớp học phần ${academicYear}`;
    return exportToExcel(formattedData, fileName, sheetName);
  } catch (error) {
    console.error('Error exporting course class statistics to Excel:', error);
    return false;
  }
}; 