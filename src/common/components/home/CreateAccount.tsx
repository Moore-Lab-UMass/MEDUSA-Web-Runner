'use client';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const FEATURES = ['Run history', 'Upload larger dataset', '[sign up feature #4]'];

export default function CreateAccount() {
  return (
    <Box component="section" sx={{ bgcolor: 'background.paper', pt: { xs: 8, md: 10 }, pb: 6, textAlign: 'center' }}>
      <Container maxWidth="md">
        <Typography component="h2" sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700 }}>
          Need to save your results and come back to it later?
        </Typography>
        <Typography sx={{ fontSize: 14, mb: 3 }}>
          Create an account to keep a history of your runs, upload larger datasets, and pick up where you left off.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mb: 3 }}>
          {FEATURES.map((feature) => (
            <Box
              key={feature}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                px: 1.5,
                py: 0.75,
                fontSize: 13,
                color: 'primary.main',
              }}
            >
              • {feature}
            </Box>
          ))}
        </Box>

        <Button variant="contained" disableElevation sx={{ fontWeight: 600, borderRadius: 1 }}>
          Sign up
        </Button>

        <Typography sx={{ fontSize: 12, mt: 10, mb: 1.5 }}>
          [Built by the Lee Lab in collaboration with Weng and Moore Lab at]
        </Typography>
        <Image
          src="/umass-logo.png"
          alt="UMass Chan Medical School"
          width={160}
          height={30}
          style={{ height: 'auto' }}
        />
      </Container>
    </Box>
  );
}
