const Document = require('./document.model');

class DocumentService {
  static async getDocuments(organizationId, { category, search }) {
    const query = { organization_id: organizationId };
    if (category) query.category = category;
    if (search) query.title = new RegExp(search, 'i');

    return await Document.find(query)
      .populate('uploaded_by', 'first_name last_name email')
      .sort({ created_at: -1 });
  }

  static async uploadDocument(organizationId, userId, data) {
    return await Document.create({
      organization_id: organizationId,
      uploaded_by: userId,
      title: data.title,
      category: data.category || 'CONSTITUTION',
      file_url: data.file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_type: data.file_type || 'PDF',
      file_size: data.file_size || '1.5 MB',
      is_public: data.is_public !== undefined ? data.is_public : true
    });
  }

  static async deleteDocument(organizationId, docId) {
    return await Document.findOneAndDelete({ _id: docId, organization_id: organizationId });
  }
}

module.exports = DocumentService;
