'use client';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';

const COLUMNS = [
  {
    id: 'col-1',
    heading: 'Lorem ipsum',
    items: [
      { id: 'col-1-item-1', label: 'Lorem ipsum' },
      { id: 'col-1-item-2', label: 'Lorem ipsum' },
      { id: 'col-1-item-3', label: 'Lorem ipsum' },
    ],
  },
  {
    id: 'col-2',
    heading: 'Lorem ipsum',
    items: [
      { id: 'col-2-item-1', label: 'Lorem ipsum' },
      { id: 'col-2-item-2', label: 'Lorem ipsum' },
    ],
  },
  {
    id: 'col-3',
    heading: 'Lorem ipsum',
    items: [
      { id: 'col-3-item-1', label: 'Lorem ipsum' },
      { id: 'col-3-item-2', label: 'Lorem ipsum' },
      { id: 'col-3-item-3', label: 'Lorem ipsum' },
      { id: 'col-3-item-4', label: 'Lorem ipsum' },
    ],
  },
  {
    id: 'col-4',
    heading: 'Lorem ipsum',
    items: [
      { id: 'col-4-item-1', label: 'Lorem ipsum' },
      { id: 'col-4-item-2', label: 'Lorem ipsum' },
      { id: 'col-4-item-3', label: 'Lorem ipsum' },
    ],
  },
];

const bottomLinkSx = { fontSize: 12, color: '#409393', '&:hover': { color: 'secondary.main' } };

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: 'primary.dark',
        backgroundImage: 'url(/footer-bg.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'auto 100%',
        color: 'primary.contrastText',
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 4, md: 7.5 }, pt: 2, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Image src="/logo-light.png" alt="MEDUSA logo" width={46} height={46} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 400, letterSpacing: 1, color: 'secondary.main', lineHeight: 1, fontSize: 24 }}
          >
            MEDUSA
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 3 }}>
          {COLUMNS.map((col) => (
            <Box key={col.id} sx={{ width: { xs: '50%', sm: 168 } }}>
              <Typography sx={{ fontSize: 13, mb: 2 }}>
                {col.heading}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {col.items.map((item) => (
                  <Link
                    key={item.id}
                    href="#"
                    underline="hover"
                    sx={{ fontSize: 11, color: 'primary.contrastText', opacity: 0.8, '&:hover': { opacity: 1 } }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ mx: { xs: 2, sm: 4, md: 5.5 }, borderColor: 'primary.main' }} />

      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 14 },
          py: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontSize: 12, color: '#409393' }}>
          Copyright © lorem ipsum
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 3, sm: 9 }, mr: { md: 15 } }}>
          <Link href="#" underline="hover" sx={bottomLinkSx}>
            Privacy & Policy
          </Link>
          <Link href="#" underline="hover" sx={bottomLinkSx}>
            Terms & Condition
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
