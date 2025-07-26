export const Pedometer = {
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  watchStepCount: jest.fn(() => ({
    remove: jest.fn(),
  })),
};