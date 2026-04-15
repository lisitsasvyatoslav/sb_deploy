import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import {
  Box,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTranslation } from '@/shared/i18n/client';
import Button from '@/shared/ui/Button';

interface ModelSettings {
  maxTokens: number | null;
  temperature: number | null;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  is_active: boolean;
  max_tokens?: number;
  context_window?: number;
}

interface ModelSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: ModelSettings, selectedModel: string) => void;
  currentSettings: ModelSettings;
  selectedModel: string;
  modelData?: AIModel;
  models?: AIModel[];
}

const ModelSettingsDialog: React.FC<ModelSettingsDialogProps> = ({
  open,
  onClose,
  onSave,
  currentSettings,
  selectedModel,
  modelData,
  models = [],
}) => {
  const { t } = useTranslation('chat');
  const [settings, setSettings] = useState<ModelSettings>(currentSettings);
  const [currentModel, setCurrentModel] = useState(selectedModel);

  // Обновляем текущую модель при изменении selectedModel
  useEffect(() => {
    setCurrentModel(selectedModel);
  }, [selectedModel]);

  // Находим данные выбранной модели
  const currentModelData =
    models.find((m) => m.id === currentModel) || modelData;

  // Создаем динамические marks на основе max_tokens модели
  const createTokenMarks = (maxTokens?: number) => {
    if (!maxTokens) {
      // Если max_tokens не указан, используем стандартные значения
      return [
        { value: 1000, label: '1K' },
        { value: 4000, label: '4K' },
        { value: 8000, label: '8K' },
        { value: 16000, label: '16K' },
        { value: 32000, label: '32K' },
      ];
    }

    const marks = [];

    // Создаем динамические marks на основе реального max_tokens модели
    const minValue = 100; // Минимальное значение
    const step = Math.max(100, Math.floor(maxTokens / 8)); // Делаем 8 шагов для лучшей читаемости

    // Добавляем промежуточные точки
    for (let i = 1; i <= 8; i++) {
      const value = Math.min(minValue + step * i, maxTokens);
      if (value <= maxTokens) {
        const label =
          value >= 1000 ? `${Math.round(value / 1000)}K` : value.toString();
        marks.push({ value, label });
      }
    }

    // Добавляем максимальное значение модели
    marks.push({
      value: maxTokens,
      label: `${Math.round(maxTokens / 1000)}K`,
    });

    return marks;
  };

  const tokenMarks = createTokenMarks(currentModelData?.max_tokens);
  const maxTokensValue = currentModelData?.max_tokens || 32000;
  const minTokensValue = 100; // Минимальное значение для всех моделей

  const handleSave = () => {
    onSave(settings, currentModel);
    onClose();
  };

  const handleReset = () => {
    setSettings({ maxTokens: null, temperature: null });
  };

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      maxWidth="sm"
    >
      <ModalHeader>
        <ModalTitle>{t('modelSettings.title')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Выбор модели */}
          {models.length > 0 && (
            <FormControl fullWidth>
              <InputLabel id="model-select-label">
                {t('modelSettings.modelLabel')}
              </InputLabel>
              <Select
                labelId="model-select-label"
                value={currentModel}
                label={t('modelSettings.modelLabel')}
                onChange={(e) => setCurrentModel(e.target.value)}
              >
                {models
                  .filter((m) => m.is_active)
                  .map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      <Box>
                        <Typography variant="body2">{model.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {model.provider} •{' '}
                          {model.max_tokens?.toLocaleString() || 'N/A'}{' '}
                          {t('modelSettings.tokensInfo')}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}

          {currentModelData?.max_tokens && (
            <Typography variant="caption" color="text.secondary">
              {t('modelSettings.maxTokensForModel', {
                count: currentModelData.max_tokens,
              })}
            </Typography>
          )}
          {/* Максимальные токены */}
          <Box>
            <Typography gutterBottom>
              {t('modelSettings.maxTokens', {
                count: settings.maxTokens || Math.min(4000, maxTokensValue),
              })}
            </Typography>
            <Slider
              value={settings.maxTokens || Math.min(4000, maxTokensValue)}
              onChange={(_, value) =>
                setSettings((prev) => ({ ...prev, maxTokens: value as number }))
              }
              min={minTokensValue}
              max={maxTokensValue}
              step={100}
              marks={tokenMarks}
              valueLabelDisplay="auto"
              sx={{
                '& .MuiSlider-markLabel': {
                  fontSize: '0.75rem',
                  transform: 'translateX(-50%)',
                },
              }}
            />
          </Box>

          {/* Температура */}
          <Box>
            <Typography gutterBottom>
              {t('modelSettings.temperature', {
                value: settings.temperature || 0.7,
              })}
            </Typography>
            <Slider
              value={settings.temperature || 0.7}
              onChange={(_, value) =>
                setSettings((prev) => ({
                  ...prev,
                  temperature: value as number,
                }))
              }
              min={0}
              max={2}
              step={0.1}
              marks={[
                { value: 0, label: '0' },
                { value: 0.7, label: '0.7' },
                { value: 1, label: '1' },
                { value: 2, label: '2' },
              ]}
              valueLabelDisplay="auto"
              sx={{
                '& .MuiSlider-markLabel': {
                  fontSize: '0.75rem',
                  transform: 'translateX(-50%)',
                },
              }}
            />
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
            >
              <span>{t('modelSettings.deterministic')}</span>
              <span>{t('modelSettings.balanced')}</span>
              <span>{t('modelSettings.creative')}</span>
              <span>{t('modelSettings.veryCreative')}</span>
            </Box>
          </Box>

          {/* Информация */}
          <Box className="!bg-[var(--bg-card)]" sx={{ p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('modelSettings.tipsTitle')}</strong>
              <br />• {t('modelSettings.tipsMaxTokens')}
              <br />• {t('modelSettings.tipsTemperature')}
              <br />• {t('modelSettings.tipsDefault')}
            </Typography>
          </Box>
        </Box>
      </ModalBody>
      <ModalFooter align="right">
        <Button onClick={handleReset} variant="ghost" size="md">
          {t('modelSettings.reset')}
        </Button>
        <Button onClick={onClose} variant="secondary" size="md">
          {t('modelSettings.cancel')}
        </Button>
        <Button onClick={handleSave} variant="accent" size="md">
          {t('modelSettings.save')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModelSettingsDialog;
