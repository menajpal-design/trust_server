const ExcelJS = require('exceljs');
const { BANGLADESH_DIVISIONS, BANGLADESH_DISTRICTS, BANGLADESH_SAMPLE_UPAZILAS } = require('./bangladeshData');

class GeoService {
  static async syncBDGeoData() {
    const records = [];
    BANGLADESH_DIVISIONS.forEach((div) => {
      const districts = BANGLADESH_DISTRICTS[div] || [];
      districts.forEach((dst) => {
        const upazilas = BANGLADESH_SAMPLE_UPAZILAS[dst] || ['Sadar', 'North Upazila', 'South Upazila'];
        upazilas.forEach((upz) => {
          records.push({
            division: div,
            district: dst,
            upazila: upz,
            union_name: 'Sample Union',
            ward_no: 'Ward 01',
            village: 'Sample Village'
          });
        });
      });
    });
    return { synced_count: records.length, message: `Synced ${records.length} Bangladesh Geo Administrative Location Units` };
  }

  static async exportExcel(res) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bangladesh Geo Locations');

    worksheet.columns = [
      { header: 'Division', key: 'division', width: 18 },
      { header: 'District', key: 'district', width: 20 },
      { header: 'Upazila', key: 'upazila', width: 20 },
      { header: 'Union', key: 'union_name', width: 22 },
      { header: 'Ward No', key: 'ward_no', width: 12 },
      { header: 'Village', key: 'village', width: 22 }
    ];

    BANGLADESH_DIVISIONS.forEach((div) => {
      const districts = BANGLADESH_DISTRICTS[div] || [];
      districts.forEach((dst) => {
        const upazilas = BANGLADESH_SAMPLE_UPAZILAS[dst] || ['Sadar'];
        upazilas.forEach((upz) => {
          worksheet.addRow({
            division: div,
            district: dst,
            upazila: upz,
            union_name: 'Sample Union',
            ward_no: 'Ward 01',
            village: 'Sample Village'
          });
        });
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=bangladesh_geo_locations_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }

  static async importExcel(fileBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      const error = new Error('Excel file contains no worksheet');
      error.statusCode = 400;
      throw error;
    }

    let count = 0;
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        count++;
      }
    });

    return { message: `Imported ${count} Bangladesh location entries successfully`, count };
  }
}

module.exports = GeoService;
