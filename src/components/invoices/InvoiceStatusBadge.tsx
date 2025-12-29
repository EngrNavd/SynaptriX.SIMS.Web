import React from 'react';
import { Chip, ChipProps, Tooltip } from '@mui/material';
import {
  Drafts as DraftIcon,
  Pending as PendingIcon,
  CheckCircle as PaidIcon,
  AttachMoney as PartialIcon,
  Cancel as CancelledIcon,
  Error as OverdueIcon,
  HourglassEmpty as UnpaidIcon,
} from '@mui/icons-material';
import { InvoiceStatus, PaymentStatus } from '@/types';

interface StatusBadgeProps {
  status: InvoiceStatus | PaymentStatus | string;
  type?: 'invoice' | 'payment';
  size?: ChipProps['size'];
  showIcon?: boolean;
  showTooltip?: boolean;
}

const InvoiceStatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'invoice',
  size = 'small',
  showIcon = true,
  showTooltip = true,
}) => {
  const getStatusConfig = () => {
    if (type === 'payment') {
      switch (status) {
        case PaymentStatus.Paid:
          return {
            label: 'Paid',
            color: 'success' as const,
            icon: <PaidIcon />,
            tooltip: 'Payment completed',
          };
        case PaymentStatus.PartiallyPaid:
          return {
            label: 'Partial',
            color: 'warning' as const,
            icon: <PartialIcon />,
            tooltip: 'Partially paid',
          };
        case PaymentStatus.Unpaid:
          return {
            label: 'Unpaid',
            color: 'default' as const,
            icon: <UnpaidIcon />,
            tooltip: 'Payment pending',
          };
        case PaymentStatus.Overdue:
          return {
            label: 'Overdue',
            color: 'error' as const,
            icon: <OverdueIcon />,
            tooltip: 'Payment overdue',
          };
        case PaymentStatus.Cancelled:
          return {
            label: 'Cancelled',
            color: 'error' as const,
            icon: <CancelledIcon />,
            tooltip: 'Payment cancelled',
          };
        default:
          return {
            label: status,
            color: 'default' as const,
            icon: null,
            tooltip: status,
          };
      }
    } else {
      switch (status) {
        case InvoiceStatus.Draft:
          return {
            label: 'Draft',
            color: 'default' as const,
            icon: <DraftIcon />,
            tooltip: 'Draft invoice - not finalized',
          };
        case InvoiceStatus.Pending:
          return {
            label: 'Pending',
            color: 'info' as const,
            icon: <PendingIcon />,
            tooltip: 'Invoice pending approval',
          };
        case InvoiceStatus.Paid:
          return {
            label: 'Paid',
            color: 'success' as const,
            icon: <PaidIcon />,
            tooltip: 'Invoice fully paid',
          };
        case InvoiceStatus.PartiallyPaid:
          return {
            label: 'Partial',
            color: 'warning' as const,
            icon: <PartialIcon />,
            tooltip: 'Partially paid invoice',
          };
        case InvoiceStatus.Cancelled:
          return {
            label: 'Cancelled',
            color: 'error' as const,
            icon: <CancelledIcon />,
            tooltip: 'Invoice cancelled',
          };
        default:
          return {
            label: status,
            color: 'default' as const,
            icon: null,
            tooltip: status,
          };
      }
    }
  };

  const config = getStatusConfig();

  const chip = (
    <Chip
      label={config.label}
      color={config.color}
      icon={showIcon && config.icon ? config.icon : undefined}
      size={size}
      variant="outlined"
      sx={{
        fontWeight: 500,
        minWidth: 80,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 16 : 20,
        },
        ...(config.color === 'success' && {
          borderColor: 'success.main',
          color: 'success.dark',
          backgroundColor: 'success.light',
        }),
        ...(config.color === 'warning' && {
          borderColor: 'warning.main',
          color: 'warning.dark',
          backgroundColor: 'warning.light',
        }),
        ...(config.color === 'info' && {
          borderColor: 'info.main',
          color: 'info.dark',
          backgroundColor: 'info.light',
        }),
        ...(config.color === 'error' && {
          borderColor: 'error.main',
          color: 'error.dark',
          backgroundColor: 'error.light',
        }),
        ...(config.color === 'default' && {
          borderColor: 'grey.400',
          color: 'grey.700',
          backgroundColor: 'grey.100',
        }),
      }}
    />
  );

  if (showTooltip && config.tooltip) {
    return (
      <Tooltip title={config.tooltip} arrow>
        {chip}
      </Tooltip>
    );
  }

  return chip;
};

export default InvoiceStatusBadge;