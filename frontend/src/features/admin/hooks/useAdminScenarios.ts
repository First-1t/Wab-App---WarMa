import { useCallback, useEffect, useState } from 'react';
import type { Scenario } from '../../../shared/types/scenario.contracts';
import { adminApi, type ScenarioOptions } from '../services/admin-api.service';

/** โหลดรายการ Scenario และตัวเลือก (พันธุ์/ฤดู/สถานะน้ำ) ที่ Output รองรับ */
export function useAdminScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [options, setOptions] = useState<ScenarioOptions | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      const { data, options } = await adminApi.listScenarios();
      setScenarios(data);
      setOptions(options);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { scenarios, options, error, reload };
}
