import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useOrders } from './useOrders';
import { useAlert } from '@/template';
import { buildManagerReportHtml } from '@/services/pdfService';
import { getWorkshopWeek } from '@/services/weekService';

/**
 * Generates a PDF of the Manager Triage view for the current Friday-Thursday cycle
 * and surfaces the system share sheet (WhatsApp, Telegram, Email, Files, ...).
 */
export function useManagerReport() {
  const { user, currentWeekOrders } = useOrders();
  const { showAlert } = useAlert();
  const [exporting, setExporting] = useState(false);

  const exportPdf = useCallback(async () => {
    if (exporting) return;
    if (currentWeekOrders.length === 0) {
      showAlert(
        'Nothing to export',
        'There are no orders in this Friday-Thursday cycle yet.',
      );
      return;
    }

    setExporting(true);
    try {
      const week = getWorkshopWeek();
      const html = buildManagerReportHtml({
        orders: currentWeekOrders,
        week,
        managerName: user.name,
      });

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Web: open the generated PDF in a new tab so the user can save/share.
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.open(uri, '_blank');
        }
        showAlert(
          'PDF generated',
          'The triage report opened in a new tab. Use your browser to share or save it.',
        );
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Sherisha Workshop · Triage ${week.label}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        showAlert(
          'PDF saved',
          `Sharing is unavailable on this device. The file was saved to:\n${uri}`,
        );
      }
    } catch (err) {
      showAlert(
        'Export failed',
        'Could not generate the PDF report. Please try again.',
      );
    } finally {
      setExporting(false);
    }
  }, [currentWeekOrders, exporting, showAlert, user.name]);

  return { exportPdf, exporting };
}
