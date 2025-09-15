import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders Project Completion Tracker title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Project Completion Tracker/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Submission Form link', () => {
  render(<App />);
  const formLink = screen.getByText(/Submission Form/i);
  expect(formLink).toBeInTheDocument();
});

test('renders Admin Dashboard link', () => {
  render(<App />);
  const dashboardLink = screen.getByText(/Admin Dashboard/i);
  expect(dashboardLink).toBeInTheDocument();
});