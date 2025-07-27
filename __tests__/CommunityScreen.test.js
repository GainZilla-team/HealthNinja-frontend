import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as router from 'expo-router';
import { fetchPosts } from '../api/postService';
import CommunityScreen from '../app/community/CommunityScreen';

jest.mock('../api/postService', () => ({
  fetchPosts: jest.fn(),
}));

describe('CommunityScreen', () => {
  const backMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(router, 'useRouter').mockReturnValue({
      back: backMock,
    });
  });

  it('calls router.back when back button pressed', () => {
    fetchPosts.mockResolvedValueOnce([]);

    const { getByText } = render(<CommunityScreen />);
    fireEvent.press(getByText('Back to Home'));
    expect(backMock).toHaveBeenCalled();
  });

  it('renders header and shows loading initially', () => {
    fetchPosts.mockReturnValue(new Promise(() => {}));

    const { getByText } = render(<CommunityScreen />);
    expect(getByText('Community')).toBeTruthy();
    expect(getByText('Share your fitness journey')).toBeTruthy();
    expect(getByText('Loading posts...')).toBeTruthy();
  });

  it('fetches posts and displays them', async () => {
    const mockPosts = [
      { _id: '1', content: 'First post', email: 'a@example.com', comments: [] },
      { _id: '2', content: 'Second post', email: 'b@example.com', comments: [] },
    ];

    fetchPosts.mockResolvedValueOnce(mockPosts);

    const { getByText, queryByText } = render(<CommunityScreen />);

    expect(getByText('Loading posts...')).toBeTruthy();

    await waitFor(() => {
      expect(queryByText('Loading posts...')).toBeNull();
    });

    expect(getByText(/Community Posts \(2\)/)).toBeTruthy();
    expect(getByText('First post')).toBeTruthy();
    expect(getByText('Second post')).toBeTruthy();
  });

  it('shows error message on fetch failure', async () => {
    fetchPosts.mockRejectedValueOnce(new Error('Network error'));

    const { getByText, queryByText } = render(<CommunityScreen />);

    expect(getByText('Loading posts...')).toBeTruthy();

    await waitFor(() => {
      expect(queryByText('Loading posts...')).toBeNull();
    });

    expect(getByText('Failed to load posts')).toBeTruthy();
  });
});
