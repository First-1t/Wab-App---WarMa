import { useState, useCallback } from 'react';
import { MatchInputDto, MatchOutputDto } from '../../../shared/types/scenario.contracts';
import { outputApiClient, ApiError } from '../services/output-api.service';

export interface UiErrorState {
  title: string;
  message: string;
  details?: string[];
  isNotFound?: boolean;
  isNetworkError?: boolean;
}

export function useOutputCalculation() {
  const [inputValues, setInputValues] = useState<MatchInputDto>({
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ต้นฤดูฝน',
    areaRai: 10,
    waterAvailableM3: 5000,
  });

  const [outputData, setOutputData] = useState<MatchOutputDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<UiErrorState | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = useCallback(
    async (
      input: MatchInputDto,
      onSuccess?: () => void,
      onNotFound?: () => void
    ) => {
      setInputValues(input);
      setValidationError(null);

      if ((input.areaRai ?? 0) <= 0) {
        setValidationError('ขนาดพื้นที่ต้องมากกว่า 0 ไร่ (Area must be greater than 0)');
        return;
      }
      if ((input.waterAvailableM3 ?? 0) <= 0) {
        setValidationError('ปริมาณน้ำต้นทุนต้องมากกว่า 0 ลบ.ม. (Water must be greater than 0)');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await outputApiClient.matchScenario(input);
        setOutputData(result);
        setError(null);
        if (onSuccess) onSuccess();
      } catch (err: unknown) {
        setOutputData(null);

        if (err instanceof ApiError) {
          if (err.isNotFound) {
            setError({
              title: 'แบบจำลองไม่รองรับเงื่อนไขนี้ (Out of Boundary)',
              message:
                err.message ||
                'ไม่มีข้อมูลสถานการณ์ที่ตรงกัน กรุณาเลือกพันธุ์มาตรฐานที่มีการสอบเทียบในระบบ (อาจารย์กำชับ: นอกเหนือ ตอบไม่ได้ ห้ามเดาผลลัพธ์)',
              isNotFound: true,
            });
            if (onNotFound) onNotFound();
          } else if (err.status === 400) {
            const detailMsg = err.details?.join(', ') || err.message;
            setValidationError(detailMsg);
          } else if (err.isNetworkError) {
            setError({
              title: 'ไม่สามารถเชื่อมต่อ Backend API ได้ (Connection Refused)',
              message: err.message,
              isNetworkError: true,
            });
          } else {
            setError({
              title: 'ข้อผิดพลาดในการประมวลผล (Processing Error)',
              message: err.message,
            });
          }
        } else {
          const msg = err instanceof Error ? err.message : 'Unknown system error';
          setError({
            title: 'ข้อผิดพลาดระบบ (System Error)',
            message: msg,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const setCropVariety = useCallback((varietyName: string) => {
    setInputValues((prev) => ({
      ...prev,
      crop: varietyName,
    }));
    setValidationError(null);
    setError(null);
  }, []);

  return {
    inputValues,
    outputData,
    isLoading,
    error,
    validationError,
    calculate,
    setCropVariety,
    setOutputData,
    setError,
    setValidationError,
  };
}
