"use client"

import {
  type ComponentProps,
  type ComponentType,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from "react"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type FilterOption = {
  value: string
  label: string
}

type FilterGroup = {
  id: string
  label: string
  options: FilterOption[]
  defaultOpen?: boolean
}

const filterGroups: FilterGroup[] = [
  {
    id: "price",
    label: "PRICE",
    defaultOpen: true,
    options: [
      { value: "price-0-1000", label: "UNDER ₹1,000" },
      { value: "price-1000-5000", label: "₹1,000 - ₹5,000" },
      { value: "price-5000-15000", label: "₹5,000 - ₹15,000" },
      { value: "price-15000-30000", label: "₹15,000 - ₹30,000" },
      { value: "price-30000-plus", label: "₹30,000 & ABOVE" },
    ],
  },
  {
    id: "color",
    label: "FRAME COLOUR",
    options: [
      { value: "color-black", label: "BLACK" },
      { value: "color-brown", label: "BROWN" },
      { value: "color-white", label: "WHITE" },
      { value: "color-gold", label: "GOLD" },
      { value: "color-natural", label: "NATURAL WOOD" },
    ],
  },
  {
    id: "size",
    label: "SIZE",
    options: [
      { value: "size-8x12", label: "8x12" },
      { value: "size-12x18", label: "12x18" },
      { value: "size-16x20", label: "16x20" },
      { value: "size-24x36", label: "24x36" },
      { value: "size-36x48", label: "36x48" },
    ],
  },
  {
    id: "glazing",
    label: "GLAZING",
    options: [
      { value: "glazing-normal", label: "NORMAL GLASS" },
      { value: "glazing-museum", label: "MUSEUM GLASS" },
      { value: "glazing-acrylic", label: "ACRYLIC" },
    ],
  },
]

const quickFilterGroups = {
  CATEGORY: {
    id: "category",
    label: "CATEGORY",
    defaultOpen: true,
    options: [
      { value: "category-imported-wooden-frames", label: "IMPORTED WOODEN FRAMES" },
      { value: "category-wall-gallery", label: "WALL GALLERY" },
      { value: "category-digital-fine-art", label: "DIGITAL FINE ART" },
      { value: "category-fine-art-prints", label: "FINE ART PRINTS" },
      { value: "category-uv-prints", label: "UV PRINTS" },
      { value: "category-mouldings", label: "MOULDINGS" },
    ],
  },
  PRICE: { ...filterGroups[0], defaultOpen: true },
  COLOR: { ...filterGroups[1], defaultOpen: true },
  SIZE: { ...filterGroups[2], defaultOpen: true },
} satisfies Record<string, FilterGroup>

function FilterGroupSection({
  group,
  selectedFilters,
  onFilterChange,
}: {
  group: FilterGroup
  selectedFilters: Set<string>
  onFilterChange: (value: string, checked: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? false)

  return (
    <details
      className="group border-b border-white/20"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary
        className="flex h-[64px] cursor-pointer list-none items-center justify-between text-[14px] font-normal uppercase leading-[1.4] tracking-[0.04em] outline-none transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.08] [&::-webkit-details-marker]:hidden"
      >
        <span>{group.label}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 stroke-[2] transition-transform duration-200 group-open:rotate-180"
        />
      </summary>

      <div className="space-y-3.5 pb-7">
        {group.options.map((option) => {
          const checkboxId = `filter-${option.value}`

          return (
            <label
              key={option.value}
              htmlFor={checkboxId}
              className="flex w-fit cursor-pointer items-center gap-3 text-[13px] font-normal uppercase leading-[1.4] tracking-[0.04em] text-white"
            >
              <Checkbox
                id={checkboxId}
                checked={selectedFilters.has(option.value)}
                onCheckedChange={(checked) =>
                  onFilterChange(option.value, checked === true)
                }
                className="size-[18px] rounded-none border-white bg-black shadow-none focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/60 dark:bg-black data-checked:border-white data-checked:bg-black data-checked:text-white dark:data-checked:bg-black"
              />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    </details>
  )
}

type FilterSheetProps = {
  groups: FilterGroup[]
  trigger: ReactElement
}

function FilterTrigger({
  label,
  Icon,
  className,
  ...buttonProps
}: {
  label: string
  Icon: ComponentType<{ className?: string }>
} & ComponentProps<"button">) {
  return (
    <button
      {...buttonProps}
      type="button"
      className={`inline-flex h-[42px] items-center justify-between gap-3 border border-black bg-white px-4 text-[13px] font-normal uppercase tracking-[0.08em] transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black${className ? ` ${className}` : ""}`}
    >
      <span>{label}</span>
      <Icon className="size-4 shrink-0 stroke-[1.9]" />
    </button>
  )
}

function FilterSheet({ groups, trigger }: FilterSheetProps) {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    () => new Set()
  )

  function handleFilterChange(value: string, checked: boolean) {
    setSelectedFilters((currentFilters) => {
      const nextFilters = new Set(currentFilters)

      if (checked) {
        nextFilters.add(value)
      } else {
        nextFilters.delete(value)
      }

      return nextFilters
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="gap-0 overflow-hidden border-l border-white/10 bg-black p-0 text-white shadow-[0_0_80px_rgba(0,0,0,0.45)]"
        style={{ width: "min(100vw, max(480px, 32vw))", maxWidth: "none" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/15 px-6 py-5">
          <SheetTitle className="text-[14px] font-normal uppercase leading-[1.4] tracking-[0.04em] text-white">
            FILTER
          </SheetTitle>
          <SheetDescription className="sr-only">
            Refine the collection by price, color, size, and edit.
          </SheetDescription>

          <SheetClose asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[13px] font-normal uppercase leading-[1.4] tracking-[0.04em] text-white/90 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span>CLOSE</span>
              <X aria-hidden="true" className="size-4 stroke-2" />
            </button>
          </SheetClose>
        </div>

        <div className="filters-panel-scrollbar min-h-0 flex-1 overflow-y-auto px-6">
          {groups.map((group) => (
            <FilterGroupSection
              key={group.id}
              group={group}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
            />
          ))}
        </div>

        <div className="shrink-0 border-t border-white/15 bg-black px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 text-center">
          <SheetClose asChild>
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center bg-white px-4 text-[14px] font-normal uppercase leading-none tracking-[0.04em] text-black transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              VIEW 190 ITEMS
            </button>
          </SheetClose>

          <button
            type="button"
            onClick={() => setSelectedFilters(new Set())}
            className="mt-4 min-h-4 text-[13px] font-normal uppercase leading-5 tracking-[0.04em] text-white underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={selectedFilters.size === 0}
          >
            CLEAR ALL
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AllFiltersSheet() {
  return (
    <FilterSheet
      groups={filterGroups}
      trigger={<FilterTrigger label="ALL FILTERS" Icon={SlidersHorizontal} />}
    />
  )
}

export type QuickFilterKey = keyof typeof quickFilterGroups

export function CollectionFilterDropdown({
  filter,
}: {
  filter: QuickFilterKey
}) {
  const group = quickFilterGroups[filter]
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    () => new Set()
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  function handleFilterChange(value: string, checked: boolean) {
    setSelectedFilters((currentFilters) => {
      const nextFilters = new Set(currentFilters)

      if (checked) nextFilters.add(value)
      else nextFilters.delete(value)

      return nextFilters
    })
  }

  return (
    <div ref={dropdownRef} className="relative">
      <FilterTrigger
        label={group.label}
        Icon={ChevronDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className={isOpen ? "!bg-black !text-white" : ""}
      />

      {isOpen && (
        <div
          role="menu"
          aria-label={`${group.label} filters`}
          className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[250px] border border-black bg-white p-4 text-[13px] font-normal text-black shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
        >
          <div className="mb-3 flex items-center justify-between border-b border-black/15 pb-3 font-normal uppercase tracking-[0.04em]">
            <span>{group.label}</span>
            <button
              type="button"
              onClick={() => setSelectedFilters(new Set())}
              className="underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={selectedFilters.size === 0}
            >
              CLEAR
            </button>
          </div>

          <div className="space-y-3">
            {group.options.map((option) => {
              const checkboxId = `quick-filter-${option.value}`

              return (
                <label
                  key={option.value}
                  htmlFor={checkboxId}
                  className="flex cursor-pointer items-center gap-3 font-normal leading-5"
                >
                  <Checkbox
                    id={checkboxId}
                    checked={selectedFilters.has(option.value)}
                    onCheckedChange={(checked) =>
                      handleFilterChange(option.value, checked === true)
                    }
                    className="size-[18px] rounded-none border-black bg-white shadow-none data-checked:border-black data-checked:bg-black data-checked:text-white"
                  />
                  <span>{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
