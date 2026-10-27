'use client';
import Image from 'next/image';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';

// An item with no href is plain text. External links open in a new tab.
type FooterItem = { label: string; href?: string; external?: boolean };

const COLUMNS: { heading: string; items: FooterItem[] }[] = [
  {
    heading: 'Simulation Tool',
    items: [{ label: 'Run a simulation', href: '/simulator' }],
  },
  {
    heading: 'Project',
    items: [
      { label: 'Source code', href: 'https://github.com/Moore-Lab-UMass/MEDUSA-Web-Runner', external: true },
    ],
  },
  {
    heading: 'Labs',
    items: [{ label: 'Lee Lab' }, { label: 'Moore Lab' }, { label: 'UMass Chan Medical School' }],
  },
];

const itemSx = { fontSize: 11, color: 'primary.contrastText', opacity: 0.8 };

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
            <Box key={col.heading} sx={{ width: { xs: '50%', sm: 168 } }}>
              <Typography sx={{ fontSize: 13, mb: 2 }}>
                {col.heading}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {col.items.map(({ label, href, external }) =>
                  !href ? (
                    <Typography key={label} sx={itemSx}>
                      {label}
                    </Typography>
                  ) : external ? (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{ ...itemSx, '&:hover': { opacity: 1 } }}
                    >
                      {label}
                    </Link>
                  ) : (
                    <Link
                      key={label}
                      component={NextLink}
                      href={href}
                      underline="hover"
                      sx={{ ...itemSx, '&:hover': { opacity: 1 } }}
                    >
                      {label}
                    </Link>
                  ),
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ mx: { xs: 2, sm: 4, md: 5.5 }, borderColor: 'primary.main' }} />

      <Box sx={{ px: { xs: 2, sm: 4, md: 14 }, py: 1.5 }}>
        <Typography sx={{ fontSize: 12, color: '#409393' }}>
          MEDUSA is a joint project of the Lee Lab and the Moore Lab at UMass Chan Medical School.
        </Typography>
      </Box>
    </Box>
  );
}
