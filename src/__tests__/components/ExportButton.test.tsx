import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportButton from '../../components/ExportButton';
import { exportUtils } from '../../utils/exportUtils';

// Mock the exportUtils
jest.mock('../../utils/exportUtils', () => ({
  exportUtils: {
    exportPayments: jest.fn(),
    exportDues: jest.fn(),
    exportCustomers: jest.fn(),
    exportAllData: jest.fn(),
  },
}));

describe('ExportButton', () => {
  const mockData = [
    {
      id: '1',
      customerName: 'John Doe',
      amount: 100,
      paymentMethod: 'cash',
      date: new Date('2024-01-01'),
      status: 'paid',
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      amount: 200,
      paymentMethod: 'online',
      date: new Date('2024-01-02'),
      status: 'paid',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders export button with default props', () => {
    render(
      <ExportButton
        dataType="payments"
        data={mockData}
      />
    );

    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeEnabled();
  });

  it('disables export button when no data provided', () => {
    render(
      <ExportButton
        dataType="payments"
        data={[]}
      />
    );

    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
  });

  it('shows dropdown menu when dropdown button is clicked', async () => {
    render(
      <ExportButton
        dataType="payments"
        data={mockData}
      />
    );

    const dropdownButton = screen.getByRole('button', { name: /chevron-down/i });
    fireEvent.click(dropdownButton);

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });
  });

  it('exports payments data when CSV format is selected', async () => {
    render(
      <ExportButton
        dataType="payments"
        data={mockData}
      />
    );

    const dropdownButton = screen.getByRole('button', { name: /chevron-down/i });
    fireEvent.click(dropdownButton);

    const csvButton = await screen.findByText('CSV');
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(exportUtils.exportPayments).toHaveBeenCalledWith(
        mockData,
        expect.objectContaining({
          format: 'csv',
          filename: undefined,
        })
      );
    });
  });

  it('exports dues data when JSON format is selected', async () => {
    render(
      <ExportButton
        dataType="dues"
        data={mockData}
      />
    );

    const dropdownButton = screen.getByRole('button', { name: /chevron-down/i });
    fireEvent.click(dropdownButton);

    const jsonButton = await screen.findByText('JSON');
    fireEvent.click(jsonButton);

    await waitFor(() => {
      expect(exportUtils.exportDues).toHaveBeenCalledWith(
        mockData,
        expect.objectContaining({
          format: 'json',
          filename: undefined,
        })
      );
    });
  });

  it('exports customers data when PDF format is selected', async () => {
    render(
      <ExportButton
        dataType="customers"
        data={mockData}
      />
    );

    const dropdownButton = screen.getByRole('button', { name: /chevron-down/i });
    fireEvent.click(dropdownButton);

    const pdfButton = await screen.findByText('PDF');
    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(exportUtils.exportCustomers).toHaveBeenCalledWith(
        mockData,
        expect.objectContaining({
          format: 'pdf',
          filename: undefined,
        })
      );
    });
  });

  it('uses custom filename when provided', async () => {
    const customFilename = 'my-custom-export.csv';
    
    render(
      <ExportButton
        dataType="payments"
        data={mockData}
        filename={customFilename}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(exportUtils.exportPayments).toHaveBeenCalledWith(
        mockData,
        expect.objectContaining({
          format: 'csv',
          filename: customFilename,
        })
      );
    });
  });

  it('applies different button variants', () => {
    const { rerender } = render(
      <ExportButton
        dataType="payments"
        data={mockData}
        variant="primary"
      />
    );

    let button = screen.getByRole('button', { name: /export/i });
    expect(button).toHaveClass('bg-blue-600');

    rerender(
      <ExportButton
        dataType="payments"
        data={mockData}
        variant="secondary"
      />
    );

    button = screen.getByRole('button', { name: /export/i });
    expect(button).toHaveClass('bg-gray-600');

    rerender(
      <ExportButton
        dataType="payments"
        data={mockData}
        variant="outline"
      />
    );

    button = screen.getByRole('button', { name: /export/i });
    expect(button).toHaveClass('border');
  });

  it('applies different button sizes', () => {
    const { rerender } = render(
      <ExportButton
        dataType="payments"
        data={mockData}
        size="sm"
      />
    );

    let button = screen.getByRole('button', { name: /export/i });
    expect(button).toHaveClass('px-3 py-1.5');

    rerender(
      <ExportButton
        dataType="payments"
        data={mockData}
        size="md"
      />
    );

    button = screen.getByRole('button', { name: /export/i });
    expect(button).toHaveClass('px-4 py-2');

    rerender(
      <ExportButton
        dataType="payments"
        data={mockData}
        size="lg"
      />
    );

    button = screen.getByRole('button', { name: /export/i });
    expect(button).toHaveClass('px-6 py-3');
  });

  it('shows loading state during export', async () => {
    // Mock a delay in export
    (exportUtils.exportPayments as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });

    render(
      <ExportButton
        dataType="payments"
        data={mockData}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    expect(screen.getByText('Exporting...')).toBeInTheDocument();
    expect(exportButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(exportButton).toBeEnabled();
    });
  });

  it('handles export errors gracefully', async () => {
    // Mock an error in export
    (exportUtils.exportPayments as jest.Mock).mockImplementation(() => {
      throw new Error('Export failed');
    });

    // Mock alert
    const mockAlert = jest.fn();
    global.alert = mockAlert;

    render(
      <ExportButton
        dataType="payments"
        data={mockData}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Export failed. Please try again.');
    });
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <ExportButton
          dataType="payments"
          data={mockData}
        />
        <div data-testid="outside-element">Outside</div>
      </div>
    );

    const dropdownButton = screen.getByRole('button', { name: /chevron-down/i });
    fireEvent.click(dropdownButton);

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    const outsideElement = screen.getByTestId('outside-element');
    fireEvent.click(outsideElement);

    await waitFor(() => {
      expect(screen.queryByText('CSV')).not.toBeInTheDocument();
    });
  });
});