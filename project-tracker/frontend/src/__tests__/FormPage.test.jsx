import { render, screen } from '@testing-library/react';
import FormPage from '../FormPage';

// Mock the api module
jest.mock('../api', () => ({
  submitForm: jest.fn()
}));

test('renders form title', () => {
  render(<FormPage />);
  const titleElement = screen.getByText(/Project Submission Form/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders required form fields', () => {
  render(<FormPage />);
  
  // Check for Lumen Name field
  const lumenNameLabel = screen.getByText(/Lumen Name/i);
  expect(lumenNameLabel).toBeInTheDocument();
  
  // Check for Prompt Screenshot field
  const screenshotLabel = screen.getByText(/Prompt Screenshot/i);
  expect(screenshotLabel).toBeInTheDocument();
  
  // Check for Prompt Text field
  const promptTextLabel = screen.getByText(/Prompt Text/i);
  expect(promptTextLabel).toBeInTheDocument();
  
  // Check for AI Used field
  const aiUsedLabel = screen.getByText(/Which AI Used/i);
  expect(aiUsedLabel).toBeInTheDocument();
  
  // Check for Reward Amount field
  const rewardAmountLabel = screen.getByText(/Reward Amount/i);
  expect(rewardAmountLabel).toBeInTheDocument();
});