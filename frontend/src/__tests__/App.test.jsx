import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders Project Completion Tracker title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Project Completion Tracker/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Submit Project link', () => {
  render(<App />);
  const formLink = screen.getByText(/Submit Project/i);
  expect(formLink).toBeInTheDocument();
});

test('renders View All Projects link', () => {
  render(<App />);
  const dashboardLink = screen.getByText(/View All Projects/i);
  expect(dashboardLink).toBeInTheDocument();
});