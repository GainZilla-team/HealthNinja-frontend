import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a28',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a28',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
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
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  overviewSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  overviewCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    padding: 20,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  categorySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  badgeCardEarned: {
    borderColor: '#7c3aed',
    backgroundColor: '#3730a3',
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeEmojiGray: {
    opacity: 0.5,
  },
  earnedIndicator: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  badgeNameGray: {
    color: '#9ca3af',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#d1d5db',
    marginBottom: 5,
  },
  badgeRequirement: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#9ca3af',
    minWidth: 30,
  },
  leaderboardSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 15,
  },
  leaderboardCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    padding: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  currentUserItem: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 5,
  },
  medalEmoji: {
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  currentUserName: {
    color: '#fbbf24',
  },
  userBadgeCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  userBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badgeEmojiSmall: {
    fontSize: 14,
  },
  emptyLeaderboard: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    padding: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default styles;