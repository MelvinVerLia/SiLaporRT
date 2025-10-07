# AdvancedFilter Component

Komponen filter lanjutan yang dapat digunakan kembali (reusable) untuk berbagai halaman dengan konfigurasi filter yang berbeda.

## Fitur

- ✅ Dropdown panel yang dapat dibuka/tutup
- ✅ Badge counter untuk menampilkan jumlah filter aktif
- ✅ Support untuk berbagai tipe filter: select, date, daterange, text
- ✅ Tombol Reset untuk menghapus semua filter
- ✅ Tombol Apply untuk menerapkan filter
- ✅ Auto-close saat klik di luar panel
- ✅ Fully customizable dengan props

## Props

```typescript
type FilterField = {
  name: string; // Unique identifier
  label: string; // Label yang ditampilkan
  type: "select" | "date" | "daterange" | "text"; // Tipe input
  options?: { value: string; label: string }[]; // Untuk type "select"
  placeholder?: string; // Placeholder text
  value?: string | { from?: string; to?: string }; // Current value
  onChange?: (value: any) => void; // Handler saat value berubah
};

type AdvancedFilterProps = {
  fields: FilterField[]; // Array of filter fields
  onApply?: () => void; // Callback saat tombol Apply diklik
  onReset?: () => void; // Callback saat tombol Reset diklik
  activeFilterCount?: number; // Jumlah filter aktif (untuk badge)
  className?: string; // Additional CSS classes
};
```

## Penggunaan

### 1. Import komponen

```typescript
import AdvancedFilter, {
  FilterField,
} from "../../components/common/AdvancedFilter";
```

### 2. Setup state untuk filter

```typescript
const [selectedCategory, setSelectedCategory] = useState("");
const [selectedStatus, setSelectedStatus] = useState("");
const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
```

### 3. Hitung active filter count (optional)

```typescript
const activeFilterCount = useMemo(() => {
  let count = 0;
  if (selectedCategory) count++;
  if (selectedStatus) count++;
  if (dateRange.from || dateRange.to) count++;
  return count;
}, [selectedCategory, selectedStatus, dateRange]);
```

### 4. Define filter fields

```typescript
const filterFields: FilterField[] = [
  {
    name: "category",
    label: "Kategori",
    type: "select",
    value: selectedCategory,
    onChange: (value) => {
      setSelectedCategory(value as string);
      setPage(1);
    },
    options: [
      { value: "", label: "Semua Kategori" },
      { value: "INFRASTRUCTURE", label: "Infrastruktur" },
      { value: "CLEANLINESS", label: "Kebersihan" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    value: selectedStatus,
    onChange: (value) => setSelectedStatus(value as string),
    options: [
      { value: "", label: "Semua Status" },
      { value: "PENDING", label: "Menunggu" },
      { value: "RESOLVED", label: "Selesai" },
    ],
  },
  {
    name: "dateRange",
    label: "Rentang Tanggal",
    type: "daterange",
    value: dateRange,
    onChange: (value) => setDateRange(value as { from?: string; to?: string }),
  },
];
```

### 5. Handler untuk reset

```typescript
const handleResetFilters = () => {
  setSelectedCategory("");
  setSelectedStatus("");
  setDateRange({});
  setPage(1);
};
```

### 6. Render komponen

```tsx
<AdvancedFilter
  fields={filterFields}
  activeFilterCount={activeFilterCount}
  onReset={handleResetFilters}
/>
```

## Contoh Penggunaan

### Halaman Manage Reports

```tsx
// State
const [selectedCategory, setSelectedCategory] = useState("");
const [selectedStatus, setSelectedStatus] = useState("");
const [selectedVisibility, setSelectedVisibility] = useState("");
const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});

// Filter fields
const filterFields: FilterField[] = [
  {
    name: "category",
    label: "Kategori",
    type: "select",
    value: selectedCategory,
    onChange: (value) => setSelectedCategory(value as string),
    options: categoryOptions,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    value: selectedStatus,
    onChange: (value) => setSelectedStatus(value as string),
    options: statusOptions,
  },
  // ... more fields
];

// Render
<AdvancedFilter
  fields={filterFields}
  activeFilterCount={activeFilterCount}
  onReset={handleResetFilters}
/>;
```

### Halaman Manage Announcements

```tsx
const filterFields: FilterField[] = [
  {
    name: "type",
    label: "Jenis",
    type: "select",
    value: selectedType,
    onChange: (value) => setSelectedType(value as string),
    options: [
      { value: "", label: "Semua Jenis" },
      { value: "GENERAL", label: "Umum" },
      { value: "URGENT", label: "Mendesak" },
    ],
  },
  {
    name: "priority",
    label: "Prioritas",
    type: "select",
    value: selectedPriority,
    onChange: (value) => setSelectedPriority(value as string),
    options: priorityOptions,
  },
];
```

## Tipe Filter yang Didukung

### 1. Select

Dropdown pilihan dengan opsi predefined

```typescript
{
  name: "status",
  label: "Status",
  type: "select",
  value: selectedStatus,
  onChange: (value) => setSelectedStatus(value as string),
  options: [
    { value: "", label: "Semua" },
    { value: "active", label: "Aktif" },
  ],
}
```

### 2. Date

Single date picker

```typescript
{
  name: "publishDate",
  label: "Tanggal Publish",
  type: "date",
  value: publishDate,
  onChange: (value) => setPublishDate(value as string),
}
```

### 3. Date Range

Dua date picker (dari - sampai)

```typescript
{
  name: "dateRange",
  label: "Rentang Tanggal",
  type: "daterange",
  value: dateRange,
  onChange: (value) => setDateRange(value as { from?: string; to?: string }),
}
```

### 4. Text

Input text field

```typescript
{
  name: "location",
  label: "Lokasi",
  type: "text",
  value: location,
  onChange: (value) => setLocation(value as string),
  placeholder: "Masukkan lokasi...",
}
```

## Styling

Komponen menggunakan Tailwind CSS dan mengikuti design system yang ada:

- Panel width: `w-80` (320px)
- Max height content: `max-h-96` dengan scroll
- Shadow: `shadow-xl`
- Border radius: `rounded-lg`
- Z-index: `z-50`

## Tips & Best Practices

1. **Active Filter Count**: Selalu hitung jumlah filter aktif menggunakan `useMemo` untuk performa yang lebih baik
2. **Reset Page**: Jangan lupa reset page ke 1 saat filter berubah
3. **Type Safety**: Gunakan type assertion yang tepat saat onChange (`value as string` atau `value as { from?: string; to?: string }`)
4. **Options**: Selalu sertakan opsi kosong ("Semua") sebagai default untuk select
5. **Reusability**: Komponen ini dapat digunakan di berbagai halaman dengan konfigurasi yang berbeda

## Roadmap / Future Improvements

- [ ] Multi-select support
- [ ] Number range filter
- [ ] Search/autocomplete untuk select dengan banyak opsi
- [ ] Custom render untuk filter field
- [ ] Export filter configuration
- [ ] Save filter presets
