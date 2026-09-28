import React, { useState, useEffect, useCallback } from 'react';
import { outputApiClient, ApiError } from './services/api';
import { MatchInputDto, MatchOutputDto } from './types/scenario.types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { VarietyGuideModal } from './components/VarietyGuideModal';
import { InputPage } from './pages/InputPage';
import { OutputPage } from './pages/OutputPage';

interface UiErrorState {
  title: string;
  message: string;
  details?: string[];
  isNotFound?: boolean;
  isNetworkError?: boolean;
}

export function App() {
  // Navigation State (/input vs /output)
  const [currentPath, setCurrentPath] = useState<'/input' | '/output'>(() => {
    return window.location.pathname === '/output' ? '/output' : '/input';
  });

  // Form Input State
  const [inputValues, setInputValues] = useState<MatchInputDto>({
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ต้นฤดูฝน',
    areaRai: 10,
    waterAvailableM3: 5000,
  });

  // Calculation Results & Error State
  const [outputData, setOutputData] = useState<MatchOutputDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<UiErrorState | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Variety Guide Modal State
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Server Connection Status
  const [serverHealth, setServerHealth] = useState<{
    online: boolean;
    scenarioCount?: number;
  }>({ online: false });

  /**
   * Safe Navigation Handler syncing browser history
   */
  const navigateTo = useCallback((path: '/input' | '/output') => {
    setCurrentPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Listen to browser Back/Forward buttons
   */
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname === '/output' ? '/output' : '/input';
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /**
   * Scenario Matching Action (Calls Backend API)
   */
  const handleCalculate = async (input: MatchInputDto) => {
    setInputValues(input);
    setValidationError(null);

    // Client-side quick check
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
      // Navigate to /output dashboard
      navigateTo('/output');
    } catch (err: unknown) {
      setOutputData(null);

      if (err instanceof ApiError) {
        if (err.isNotFound) {
          // Boundary / Uncalibrated crop case: Route to /output to show dedicated boundary view
          setError({
            title: 'แบบจำลองไม่รองรับเงื่อนไขนี้ (Out of Boundary)',
            message:
              err.message ||
              'ไม่มีข้อมูลสถานการณ์ที่ตรงกัน กรุณาเลือกพันธุ์มาตรฐานที่มีการสอบเทียบในระบบ (อาจารย์กำชับ: นอกเหนือ ตอบไม่ได้ ห้ามเดาผลลัพธ์)',
            isNotFound: true,
          });
          navigateTo('/output');
        } else if (err.status === 400) {
          const detailMsg = err.details?.join(', ') || err.message;
          setValidationError(detailMsg);
          // Stay on input page to allow user to correct
          navigateTo('/input');
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
  };

  /**
   * Action when user selects a calibrated variety from boundary alert or modal
   */
  const handleSelectCalibratedVariety = (varietyName: string) => {
    const updated = {
      ...inputValues,
      crop: varietyName,
    };
    setInputValues(updated);
    setValidationError(null);
    setError(null);
    navigateTo('/input');
  };

  /**
   * Initialize server check and pre-run default scenario
   */
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const health = await outputApiClient.checkHealth();
        if (isMounted) {
          setServerHealth({
            online: true,
            scenarioCount: health.scenarioCount,
          });
        }

        const defaultInput: MatchInputDto = {
          crop: 'เกษตรศาสตร์ 50',
          plantingSeason: 'ต้นฤดูฝน',
          areaRai: 10,
          waterAvailableM3: 5000,
        };
        const result = await outputApiClient.matchScenario(defaultInput);
        if (isMounted) {
          setOutputData(result);
        }
      } catch {
        if (isMounted) {
          setServerHealth({ online: false });
        }
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans selection:bg-primary-fixed selection:text-on-primary-fixed overflow-x-hidden w-full relative">
      {/* Top Header Navigation */}
      <Header
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenGuide={() => setIsGuideOpen(true)}
        isBackendOnline={serverHealth.online}
      />

      {/* Main Page Routing */}
      <main className="flex-1 w-full overflow-x-hidden">
        {currentPath === '/input' ? (
          <InputPage
            initialValues={inputValues}
            onSubmit={handleCalculate}
            isLoading={isLoading}
            validationError={validationError}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        ) : (
          <OutputPage
            inputData={inputValues}
            outputData={outputData}
            error={error}
            onNavigateToInput={() => navigateTo('/input')}
            onSelectCalibratedVariety={handleSelectCalibratedVariety}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Cassava Variety Guide Modal */}
      <VarietyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSelectVariety={handleSelectCalibratedVariety}
      />
    </div>
  );
}

export default App;
