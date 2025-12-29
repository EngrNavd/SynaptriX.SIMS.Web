import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Paid as PaidIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { UAEUtils } from '@/utils/uae.utils';

interface InvoiceSummaryCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  progress?: number;
  subtitle?: string;
  tooltip?: string;
  isCurrency?: boolean;
}

const InvoiceSummaryCard: React.FC<InvoiceSummaryCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  progress,
  subtitle,
  tooltip,
  isCurrency = false,
}) => {
  const getColor = () => {
    switch (color) {
      case 'success': return { main: '#10B981', light: '#D1FAE5' };
      case 'warning': return { main: '#F59E0B', light: '#FEF3C7' };
      case 'error': return { main: '#EF4444', light: '#FEE2E2' };
      case 'info': return { main: '#3B82F6', light: '#DBEAFE' };
      default: return { main: '#0A2463', light: '#E0E7FF' };
    }
  };

  const colors = getColor();
  
  const getIcon = () => {
    if (icon) return icon;
    
    switch (color) {
      case 'success': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <WarningIcon />;
      case 'info': return <ReceiptIcon />;
      default: return <MoneyIcon />;
    }
  };

  const formattedValue = isCurrency 
    ? UAEUtils.formatCurrency(typeof value === 'number' ? value : parseFloat(value) || 0)
    : value;

  const cardContent = (
    <Card sx={{ 
      height: '100%',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 8,
      },
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {title}
          </Typography>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            bgcolor: colors.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.main,
          }}>
            {getIcon()}
          </Box>
        </Box>

        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          {formattedValue}
        </Typography>

        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            {trend.isPositive ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography 
              variant="caption" 
              color={trend.isPositive ? 'success.main' : 'error.main'}
              fontWeight="medium"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {trend.label}
            </Typography>
          </Box>
        )}

        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: colors.main,
                  borderRadius: 3,
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" fontWeight="medium">
                {progress}%
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
};

export default InvoiceSummaryCard;