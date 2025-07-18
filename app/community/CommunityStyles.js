import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFC0CB',
  },
  button: {
    marginTop: 25,
  },
  content: {
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 16,
  },
  input: {
    borderColor: 'grey',
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
  },
  postContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  postEmail: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postContent: {
    marginBottom: 6,
  },
  commentsContainer: {
    marginTop: 8,
  },
  comment: {
    fontSize: 12,
    color: 'grey',
  },
  commentInputContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 6,
    borderRadius: 4,
  },
  commentsContainer: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#ccc',
  },
  commentContainer: {
    marginBottom: 5,
  },
  commentEmail: {
    fontWeight: 'bold',
  },
  commentText: {
    marginLeft: 5,
    color:'black',
  },

});