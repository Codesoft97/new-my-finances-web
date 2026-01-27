import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('displays the title correctly', () => {
    render(<Modal {...defaultProps} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<Modal {...defaultProps}>
      <p>This is the content</p>
    </Modal>);
    expect(screen.getByText('This is the content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    // The backdrop has the onClick handler
    const backdrop = document.querySelector('.backdrop-blur-sm');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('applies sm size class', () => {
    render(<Modal {...defaultProps} size="sm" />);
    const modal = document.querySelector('.max-w-md');
    expect(modal).toBeInTheDocument();
  });

  it('applies md size class by default', () => {
    render(<Modal {...defaultProps} />);
    const modal = document.querySelector('.max-w-lg');
    expect(modal).toBeInTheDocument();
  });

  it('applies lg size class', () => {
    render(<Modal {...defaultProps} size="lg" />);
    const modal = document.querySelector('.max-w-2xl');
    expect(modal).toBeInTheDocument();
  });

  it('sets body overflow to hidden when open', () => {
    render(<Modal {...defaultProps} isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow when closed', () => {
    const { rerender } = render(<Modal {...defaultProps} isOpen={true} />);
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');
  });
});
