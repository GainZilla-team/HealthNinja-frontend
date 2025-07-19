import { fireEvent, render, waitFor } from '@testing-library/react-native';
import CommunityScreen from '../app/community/CommunityScreen';

// Mock the API module
jest.mock('../app/community/api', () => ({
  fetchPosts: jest.fn(),
}));

// Create a jest.fn() to spy on `back`
const mockBack = jest.fn();

// Mock expo-router's useRouter hook once, exporting the mockBack
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

// Mock Post component
jest.mock('../app/community/post', () => {
  const React = require('react');
  const { Text, Button } = require('react-native');
  return (props) => (
    <>
      <Text testID="post-title">{props.post.title}</Text>
      <Button
        testID={`delete-btn-${props.post._id}`}
        title="Delete"
        onPress={() => props.onDelete(props.post._id)}
      />
    </>
  );
});

// Mock CreatePostForm component
jest.mock('../app/community/CreatePostForm', () => {
  const React = require('react');
  const { Button } = require('react-native');
  return (props) => <Button title="Create Post" onPress={props.onPostCreated} />;
});

import { fetchPosts } from '../app/community/api';

describe('CommunityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays posts, handles delete and go back', async () => {
    // Arrange
    const mockPosts = [
      { _id: '1', title: 'Post One' },
      { _id: '2', title: 'Post Two' },
    ];

    fetchPosts.mockResolvedValue(mockPosts);

    const { getByText, queryByText, getByTestId } = render(<CommunityScreen />);

    // Assert fetchPosts called once on mount
    await waitFor(() => {
      expect(fetchPosts).toHaveBeenCalledTimes(1);
    });

    // Assert posts rendered
    expect(getByText('Post One')).toBeTruthy();
    expect(getByText('Post Two')).toBeTruthy();

    // Simulate deleting post 1
    fireEvent.press(getByTestId('delete-btn-1'));

    // Post One should be removed from UI
    expect(queryByText('Post One')).toBeNull();
    expect(getByText('Post Two')).toBeTruthy();

    // Simulate CreatePostForm triggering onPostCreated (refetch)
    fetchPosts.mockResolvedValueOnce([{ _id: '3', title: 'Post Three' }]);
    fireEvent.press(getByText('Create Post'));

    await waitFor(() => {
      expect(getByText('Post Three')).toBeTruthy();
    });

    // Test Go Back button triggers router.back
    fireEvent.press(getByText('Go Back'));
    expect(mockBack).toHaveBeenCalled(); // <-- use the mockBack variable here!
  });
});
