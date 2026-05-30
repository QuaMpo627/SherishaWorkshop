import * as DocumentPicker from 'expo-document-picker';
import { useOrders } from './useOrders';
import { useAlert } from '@/template';

export function useExecutionFiles() {
  const { addExecutionFile, removeExecutionFile } = useOrders();
  const { showAlert } = useAlert();

  const pickAndAttach = async (orderId: string, orderName?: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return null;
      const asset = result.assets?.[0];
      if (!asset) return null;
      addExecutionFile(orderId, {
        name: asset.name,
        uri: asset.uri,
        size: asset.size,
        mimeType: asset.mimeType,
      });
      showAlert(
        'File attached',
        orderName
          ? `${asset.name} added to ${orderName}.`
          : `${asset.name} added to the order.`,
      );
      return asset;
    } catch (err) {
      showAlert('Upload failed', 'Could not attach file. Please try again.');
      return null;
    }
  };

  const remove = (orderId: string, fileId: string, fileName?: string) => {
    showAlert(
      'Remove file?',
      fileName ? `${fileName} will be detached.` : 'This file will be detached.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeExecutionFile(orderId, fileId),
        },
      ],
    );
  };

  return { pickAndAttach, remove };
}
