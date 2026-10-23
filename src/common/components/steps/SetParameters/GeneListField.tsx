import { ChangeEvent, ClipboardEvent, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import { MAX_GENE_LIST, parseGeneList } from '@/common/parameters';

// Far more than 1000 gene names take, so anything bigger is the wrong file.
const MAX_UPLOAD_BYTES = 1024 * 1024;

// How many matches the search lists at once.
const SEARCH_LIMIT = 50;

// How many of a file's genes not in the data the note names.
const MISSING_SHOWN = 5;

const TOOLTIP =
  '[gene_list] genes to highlight in the phase diagram, or to plot histograms for in the general model, in place of the top 10 pro-death and anti-death hits. Only genes in your uploaded data can be picked.';

const lower = (gene: string) => gene.toLowerCase();

// The genes matching the search, those starting with it first, less those already picked.
function searchGenes(genes: string[], query: string, picked: ReadonlySet<string>) {
  const text = lower(query.trim());
  if (!text) return [];
  const starting: string[] = [];
  const containing: string[] = [];
  for (const gene of genes) {
    const key = lower(gene);
    if (picked.has(key)) continue;
    if (key.startsWith(text)) {
      starting.push(gene);
      if (starting.length === SEARCH_LIMIT) break;
    } else if (containing.length < SEARCH_LIMIT && key.includes(text)) {
      containing.push(gene);
    }
  }
  return [...starting, ...containing].slice(0, SEARCH_LIMIT);
}

// The run's gene_list, picked one at a time by searching the genes in the uploaded data, or added
// in bulk from a file or a paste, keeping only those the data has.
export default function GeneListField({
  value,
  onChange,
  error,
  genes,
}: {
  // One gene per line.
  value: string;
  onChange: (value: string) => void;
  error?: string;
  // The genes in the uploaded data, sorted: all that can be picked.
  genes: string[];
}) {
  const [query, setQuery] = useState('');
  // The names in the last file or paste that the data doesn't have.
  const [skipped, setSkipped] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const picked = useMemo(() => parseGeneList(value), [value]);
  const pickedKeys = useMemo(() => new Set(picked.map(lower)), [picked]);
  // Each gene under its lower case name, so a list's spelling is matched to the data's.
  const byName = useMemo(() => new Map(genes.map((gene) => [lower(gene), gene])), [genes]);

  const add = (names: string[]) => {
    const next = [...picked];
    const seen = new Set(pickedKeys);
    const missing: string[] = [];
    for (const name of names) {
      const gene = byName.get(lower(name));
      if (!gene) missing.push(name);
      else if (!seen.has(lower(gene))) {
        seen.add(lower(gene));
        next.push(gene);
      }
    }
    onChange(next.join('\n'));
    setSkipped(missing);
    setUploadError(null);
  };
  const remove = (gene: string) => onChange(picked.filter((other) => other !== gene).join('\n'));
  const clear = () => {
    onChange('');
    setSkipped([]);
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Cleared so picking the same file again still fires a change.
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(`${file.name} is too large for a gene list.`);
      return;
    }
    try {
      add(parseGeneList(await file.text()));
    } catch {
      setUploadError(`Could not read ${file.name}.`);
    }
  };

  // A pasted list is added whole, as a file would be; a single name is searched for.
  const handlePaste = (event: ClipboardEvent) => {
    const names = parseGeneList(event.clipboardData.getData('text'));
    if (names.length < 2) return;
    event.preventDefault();
    add(names);
    setQuery('');
  };

  const status = [
    picked.length > 0 &&
      `${picked.length.toLocaleString()} gene${picked.length === 1 ? '' : 's'} picked, of up to ${MAX_GENE_LIST.toLocaleString()}`,
    skipped.length > 0 &&
      `${skipped.length.toLocaleString()} not in your data, left out: ${skipped.slice(0, MISSING_SHOWN).join(', ')}${skipped.length > MISSING_SHOWN ? '…' : ''}`,
  ]
    .filter(Boolean)
    .join(' · ');
  const message =
    error ?? uploadError ?? (status || 'Search for genes, or add a list from a file. Leave empty for the top hits.');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography sx={{ fontSize: 13.5, color: '#555' }}>Genes to highlight</Typography>
        <Tooltip title={TOOLTIP}>
          <InfoOutlinedIcon sx={{ fontSize: 20, color: '#999' }} />
        </Tooltip>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          {picked.length > 0 && (
            <Button size="small" onClick={clear} sx={{ textTransform: 'none' }}>
              Clear all
            </Button>
          )}
          <Button
            component="label"
            size="small"
            startIcon={<UploadFileIcon />}
            disabled={genes.length === 0}
            sx={{ textTransform: 'none' }}
          >
            Add from file
            <input type="file" accept=".txt,.csv,.tsv,text/plain,text/csv" hidden onChange={handleUpload} />
          </Button>
        </Box>
      </Box>

      <Autocomplete
        options={genes}
        value={null}
        inputValue={query}
        // Picking a gene resets the input to its name, which is cleared instead.
        onInputChange={(_, text, reason) => {
          if (reason !== 'reset') setQuery(text);
        }}
        onChange={(_, gene) => {
          if (gene) add([gene]);
          setQuery('');
        }}
        filterOptions={(options) => searchGenes(options, query, pickedKeys)}
        autoHighlight
        disabled={genes.length === 0}
        noOptionsText={query.trim() ? 'No gene in your data matches' : 'Type a gene name'}
        size="small"
        renderInput={({ InputProps, inputProps, InputLabelProps, ...params }) => (
          <TextField
            {...params}
            placeholder={
              genes.length > 0 ? `Search ${genes.length.toLocaleString()} genes in your data` : 'No genes found in your data'
            }
            onPaste={handlePaste}
            error={!!error || !!uploadError}
            helperText={message}
            slotProps={{
              inputLabel: InputLabelProps,
              input: {
                ...InputProps,
                startAdornment: <SearchIcon sx={{ fontSize: 18, color: '#999', ml: 0.5 }} />,
              },
              htmlInput: { ...inputProps, spellCheck: false, 'aria-label': 'Search genes' },
            }}
            sx={{ bgcolor: '#fff' }}
          />
        )}
      />

      {picked.length > 0 && (
        <Box
          sx={{
            mt: 1.5,
            p: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            maxHeight: 160,
            overflowY: 'auto',
            bgcolor: '#fff',
            border: '1px solid #dfe3e8',
            borderRadius: 1,
          }}
        >
          {picked.map((gene) =>
            byName.has(lower(gene)) ? (
              <Chip key={gene} size="small" label={gene} onDelete={() => remove(gene)} />
            ) : (
              // Picked from files since replaced: kept, but marked, as MEDUSA will skip it.
              <Tooltip key={gene} title="Not in your current data">
                <Chip size="small" color="warning" variant="outlined" label={gene} onDelete={() => remove(gene)} />
              </Tooltip>
            ),
          )}
        </Box>
      )}
    </Box>
  );
}
