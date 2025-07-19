import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a28',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: '300',
    color: '#6366f1',
    marginBottom: 5,
  },
  currentDate: {
    fontSize: 16,
    color: '#9ca3af',
  },
  mainSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sleepButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 25,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3730a3',
  },
  sleepButtonActive: {
    backgroundColor: '#1e40af',
    borderColor: '#3b82f6',
  },
  sleepButtonContent: {
    alignItems: 'center',
  },
  sleepButtonIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  sleepButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  sleepButtonSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 15,
  },
  historySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  historyDate: {
    marginRight: 15,
  },
  historyDateText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  historyDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
  },
  historyDuration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  qualityStars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 2,
  },
  starFilled: {
    color: '#fbbf24',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default styles;