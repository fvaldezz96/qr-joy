// // app/(admin)/qr-scanner.tsx
// import { useEffect, useState } from 'react';
// import { View, Text, Alert } from 'react-native';
// import { Camera, CameraView } from 'expo-camera';
// import { useAppDispatch } from '../../src/hooks';
// import { redeemQr } from '../../src/store/slices/adminSlice';
// 
// export default function QrScanner() {
//   const [permission, requestPermission] = Camera.useCameraPermissions();
//   const [scanned, setScanned] = useState(false);
//   const dispatch = useAppDispatch();
// 
//   useEffect(() => {
//     if (!permission) requestPermission();
//   }, [permission]);
// 
//   if (!permission) return <Text>Solicitando permisos…</Text>;
//   if (!permission.granted) return <Text>Sin permiso de cámara</Text>;
// 
//   const onScanned = async (res: { data: string }) => {
//     if (scanned) return;
//     setScanned(true);
//     try {
//       const payload = JSON.parse(res.data) as { c: string; s: string };
//       await dispatch(redeemQr({ code: payload.c, signature: payload.s })).unwrap();
//       Alert.alert('OK', 'QR validado y consumido');
//     } catch (e: any) {
//       Alert.alert('Error', 'QR inválido o ya usado');
//     } finally {
//       // permitir volver a escanear después de 1.2s
//       setTimeout(() => setScanned(false), 1200);
//     }
//   };
// 
//   return (
//     <View style={{ flex: 1 }}>
//       <CameraView
//         style={{ flex: 1 }}
//         barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
//         onBarcodeScanned={onScanned}
//       />
//     </View>
//   );
// }
