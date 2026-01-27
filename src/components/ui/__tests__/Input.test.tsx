import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import Input from '../Input';

describe('Input', () => {
  it('renders without label when not provided', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.queryByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('applies error styles when error is provided', () => {
    render(<Input error="This field is required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('displays error message when error is provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('does not display error message when error is not provided', () => {
    render(<Input />);
    const errorElement = screen.queryByText(/required/i);
    expect(errorElement).not.toBeInTheDocument();
  });

  it('applies normal styles when no error', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-gray-300');
    expect(input).not.toHaveClass('border-red-500');
  });

  it('forwards ref to input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('allows typing in the input', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('passes additional props to input element', () => {
    render(<Input type="email" placeholder="Enter email" data-testid="email-input" />);
    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter email');
  });

  it('merges custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
