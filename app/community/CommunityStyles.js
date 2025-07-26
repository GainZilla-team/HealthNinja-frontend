import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  postContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postEmail: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  postDate: {
    color: '#64748b',
    fontSize: 12,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    color: '#1e293b',
  },
  deleteButton: {
    marginBottom: 12,
  },
  commentsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  commentsTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#475569',
  },
  commentContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentEmail: {
    fontWeight: '600',
    color: '#3b82f6',
    fontSize: 14,
  },
  commentDate: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
  },
  commentText: {
    fontSize: 14,
    color: '#000000', // Black color for comment text
    lineHeight: 20,
  },
  commentInputContainer: {
    marginTop: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    minHeight: 50,
    color: '#000000', // Black color for input text
  },
});