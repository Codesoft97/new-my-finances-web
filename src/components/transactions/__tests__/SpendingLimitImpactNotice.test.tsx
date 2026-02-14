import { render, screen } from '@testing-library/react';
import SpendingLimitImpactNotice from '../SpendingLimitImpactNotice';

describe('SpendingLimitImpactNotice', () => {
  it('shows projected values with percentage and remaining amount', () => {
    render(
      <SpendingLimitImpactNotice
        categoryName="Alimentacao"
        limitAmount={500}
        spentAmount={200}
        nextExpenseAmount={50}
      />
    );

    const notice = screen.getByTestId('spending-limit-impact-notice');
    expect(screen.getByText(/Impacto no limite da categoria Alimentacao/i)).toBeInTheDocument();
    expect(notice).toHaveTextContent('250,00');
    expect(notice).toHaveTextContent('50.0');
    expect(notice).not.toHaveTextContent('Ja gasto');
    expect(notice).not.toHaveTextContent('Nova despesa');
    expect(screen.getByText(/Restante apos lancamento:/i)).toBeInTheDocument();
  });

  it('shows over-limit warning when projected amount exceeds limit', () => {
    render(
      <SpendingLimitImpactNotice
        categoryName="Transporte"
        limitAmount={300}
        spentAmount={280}
        nextExpenseAmount={50}
      />
    );

    const notice = screen.getByTestId('spending-limit-impact-notice');
    expect(notice).toHaveTextContent('330,00');
    expect(notice).toHaveTextContent('110.0');
    expect(screen.getByText(/ultrapassa o limite em/i)).toBeInTheDocument();
    expect(notice).toHaveTextContent('30,00');
  });

  it('does not render when limit amount is invalid', () => {
    const { container } = render(
      <SpendingLimitImpactNotice
        categoryName="Lazer"
        limitAmount={0}
        spentAmount={100}
        nextExpenseAmount={20}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
