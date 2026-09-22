import { useEffect, useState } from "react";
import StorageService from "@/services/storageService";

const STORAGE_KEY = "customizedPdfCountryTabs";

export default function usePersistedCountryTabs(widgetKey, defaultActiveKey) {
  const [openCountries, setOpenCountries] = useState(() => {
    const stored = StorageService.get(STORAGE_KEY);
    return stored?.[widgetKey]?.openCountries || [];
  });
  const [activeKey, setActiveKey] = useState(() => {
    const stored = StorageService.get(STORAGE_KEY);
    return stored?.[widgetKey]?.activeKey ?? defaultActiveKey;
  });

  useEffect(() => {
    const stored = StorageService.get(STORAGE_KEY) || {};
    StorageService.set(STORAGE_KEY, {
      ...stored,
      [widgetKey]: { openCountries, activeKey },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetKey, openCountries, activeKey]);

  return [openCountries, setOpenCountries, activeKey, setActiveKey];
}
