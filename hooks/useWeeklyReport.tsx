import { useMemo } from 'react';
import { useOrders } from './useOrders';
import { getPreviousWeek, getWorkshopWeek, isInWeek } from '@/services/weekService';

export function useWeeklyReport() {
  const { visibleOrders } = useOrders();

  return useMemo(() => {
    const current = getWorkshopWeek();
    const previous = getPreviousWeek(current);

    const inCurrent = visibleOrders.filter((o) => isInWeek(o.createdAt, current));
    const inPrevious = visibleOrders.filter((o) => isInWeek(o.createdAt, previous));

    const sumPlates = (arr: typeof visibleOrders) =>
      arr.reduce((s, o) => s + (o.actualSheets ?? o.estimatedSheets ?? 0), 0);

    const completed = inCurrent.filter((o) => o.status === 'done').length;
    const pending = inCurrent.filter((o) => o.status === 'pending').length;

    const platesThisWeek = sumPlates(inCurrent);
    const platesPrevWeek = sumPlates(inPrevious);
    const delta = platesThisWeek - platesPrevWeek;

    return {
      currentWeek: current,
      previousWeek: previous,
      ordersThisWeek: inCurrent.length,
      ordersPrevWeek: inPrevious.length,
      completed,
      pending,
      platesThisWeek,
      platesPrevWeek,
      delta,
    };
  }, [visibleOrders]);
}
