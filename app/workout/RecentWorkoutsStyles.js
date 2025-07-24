import { StyleSheet } from 'react-native';

const COLORS = {
  yellow: '#FFD600',
  pink: '#FF4081',
  blue: '#2979FF',
  cardBg: '#fff',
  cardShadow: '#E0E0E0',
  background: '#fff', // Clean white background
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60, // Add top padding to move content away from status bar
    paddingBottom: 100, // Add bottom padding to account for the go back button
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.blue,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 24,
    alignItems: 'center',
    flexGrow: 1, // Ensures content takes up available space
  },
  card: {
    marginBottom: 18,
    padding: 16,
    backgroundColor: '#fff', // Clean white card
    borderRadius: 14,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 8,
    elevation: 2,
    width: '90%',
    alignSelf: 'center',
  },
  type: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 6,
    letterSpacing: 1,
    textAlign: 'center',
  },
  detail: {
    fontSize: 15,
    marginBottom: 2,
    color: '#333',
    textAlign: 'center',
  },
  value: {
    fontWeight: '600',
    color: COLORS.blue,
  },
  detailsButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
    width: '70%',
    alignSelf: 'center',
  },
  detailsButtonText: {
    color: COLORS.cardBg,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff', // Clean white background
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0', // Very subtle border
    alignItems: 'center',
  },
  goBackButton: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 4,
    elevation: 3,
  },
  goBackText: {
    color: COLORS.blue,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Clean white background
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: '500',
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: COLORS.pink,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noWorkoutsText: {
    fontSize: 18,
    color: COLORS.pink,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
});

export default styles;