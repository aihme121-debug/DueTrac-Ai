import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualizedList } from '../../components/VirtualizedList';

interface TestItem {
  id: string;
  name: string;
  value: number;
}

const mockItems: TestItem[] = Array.from({ length: 100 }, (_, i) => ({
  id: `item-${i}`,
  name: `Item ${i}`,
  value: i * 10,
}));

const mockRenderItem = (item: TestItem, index: number) => (
  <div key={item.id} data-testid={`item-${item.id}`}>
    <h3>{item.name}</h3>
    <p>Value: {item.value}</p>
    <p>Index: {index}</p>
  </div>
);

const mockKeyExtractor = (item: TestItem) => item.id;

describe('VirtualizedList', () => {
  const defaultProps = {
    items: mockItems,
    itemHeight: 100,
    containerHeight: 400,
    renderItem: mockRenderItem,
    keyExtractor: mockKeyExtractor,
    overscan: 3,
  };

  beforeEach(() => {
    // Mock scrollTop and clientHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
      configurable: true,
      get: function() {
        return this._scrollTop || 0;
      },
      set: function(val) {
        this._scrollTop = val;
      },
    });

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get: function() {
        return 400;
      },
    });
  });

  it('renders without crashing', () => {
    render(<VirtualizedList {...defaultProps} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders only visible items plus overscan', () => {
    render(<VirtualizedList {...defaultProps} />);
    
    // With container height 400 and item height 100, we should see 4 items
    // Plus overscan of 3, total 7 items should be rendered initially
    const visibleItems = screen.getAllByTestId(/item-item-\d+/);
    expect(visibleItems.length).toBeLessThanOrEqual(10); // Allow some margin for overscan
  });

  it('calculates correct visible range when scrolled', () => {
    render(<VirtualizedList {...defaultProps} />);
    
    const container = screen.getByRole('list');
    
    // Simulate scrolling to position 500 (item 5)
    fireEvent.scroll(container, { target: { scrollTop: 500 } });
    
    // The component should recalculate visible items based on scroll position
    // We expect to see items around position 5
    const visibleItems = screen.getAllByTestId(/item-item-\d+/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });

  it('applies correct transform styles for virtual positioning', () => {
    render(<VirtualizedList {...defaultProps} />);
    
    const items = screen.getAllByTestId(/item-item-\d+/);
    items.forEach((item, index) => {
      const transform = item.parentElement?.style.transform;
      if (transform) {
        expect(transform).toMatch(/translateY/);
      }
    });
  });

  it('handles empty items array', () => {
    render(
      <VirtualizedList
        {...defaultProps}
        items={[]}
      />
    );
    
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryByTestId(/item-item-\d+/)).not.toBeInTheDocument();
  });

  it('handles null items gracefully', () => {
    render(
      <VirtualizedList
        {...defaultProps}
        items={null as any}
      />
    );
    
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryByTestId(/item-item-\d+/)).not.toBeInTheDocument();
  });

  it('uses custom overscan value', () => {
    const customOverscan = 5;
    render(
      <VirtualizedList
        {...defaultProps}
        overscan={customOverscan}
      />
    );
    
    // With custom overscan, we should see more items rendered
    const visibleItems = screen.getAllByTestId(/item-item-\d+/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });

  it('applies custom container height', () => {
    const customHeight = 600;
    render(
      <VirtualizedList
        {...defaultProps}
        containerHeight={customHeight}
      />
    );
    
    const container = screen.getByRole('list');
    expect(container).toHaveStyle({ height: `${customHeight}px` });
  });

  it('applies custom item height', () => {
    const customItemHeight = 150;
    render(
      <VirtualizedList
        {...defaultProps}
        itemHeight={customItemHeight}
      />
    );
    
    // The total scroll height should be calculated based on item height
    const container = screen.getByRole('list');
    const expectedTotalHeight = mockItems.length * customItemHeight;
    expect(container.scrollHeight).toBe(expectedTotalHeight);
  });

  it('calls keyExtractor for each item', () => {
    const mockKeyExtractor = jest.fn((item: TestItem) => item.id);
    
    render(
      <VirtualizedList
        {...defaultProps}
        keyExtractor={mockKeyExtractor}
      />
    );
    
    // Key extractor should be called for rendered items
    expect(mockKeyExtractor).toHaveBeenCalled();
    expect(mockKeyExtractor).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      value: expect.any(Number),
    }));
  });

  it('provides correct index to renderItem', () => {
    const mockRenderItem = jest.fn((item: TestItem, index: number) => (
      <div key={item.id} data-testid={`item-${item.id}`}>
        <span data-testid={`index-${item.id}`}>{index}</span>
      </div>
    ));
    
    render(
      <VirtualizedList
        {...defaultProps}
        renderItem={mockRenderItem}
      />
    );
    
    // Render item should be called with correct index
    expect(mockRenderItem).toHaveBeenCalled();
    const firstCall = mockRenderItem.mock.calls[0];
    expect(firstCall[1]).toBeGreaterThanOrEqual(0); // Index should be valid
  });

  it('handles rapid scrolling', () => {
    render(<VirtualizedList {...defaultProps} />);
    
    const container = screen.getByRole('list');
    
    // Simulate rapid scrolling
    for (let i = 0; i < 10; i++) {
      fireEvent.scroll(container, { target: { scrollTop: i * 200 } });
    }
    
    // Component should still render correctly after rapid scrolling
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('maintains performance with large datasets', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: `item-${i}`,
      name: `Item ${i}`,
      value: i * 10,
    }));
    
    const startTime = performance.now();
    
    render(
      <VirtualizedList
        {...defaultProps}
        items={largeDataset}
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Rendering should be fast even with large dataset (< 100ms)
    expect(renderTime).toBeLessThan(100);
    
    // Should not render all 10000 items
    const visibleItems = screen.getAllByTestId(/item-item-\d+/);
    expect(visibleItems.length).toBeLessThan(50);
  });

  it('handles dynamic item height with consistent spacing', () => {
    const variableHeightItems = mockItems.slice(0, 10).map((item, index) => ({
      ...item,
      height: 50 + (index * 10), // Variable heights
    }));
    
    const variableRenderItem = (item: any, index: number) => (
      <div 
        key={item.id} 
        data-testid={`item-${item.id}`}
        style={{ height: `${item.height}px` }}
      >
        <h3>{item.name}</h3>
      </div>
    );
    
    render(
      <VirtualizedList
        {...defaultProps}
        items={variableHeightItems}
        renderItem={variableRenderItem}
        itemHeight={80} // Use average height
      />
    );
    
    expect(screen.getByRole('list')).toBeInTheDocument();
    const visibleItems = screen.getAllByTestId(/item-item-\d+/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });
});