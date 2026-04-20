import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";

const HISTORY_KEY = "psas-city-search-history";
const MAX_HISTORY = 8;

export default function CitySelector({ cities, selectedCity, onSelectCity }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setHistory(parsed.filter((id) => cities.some((city) => city.id === id)));
      }
    } catch {
      setHistory([]);
    }
  }, [cities]);

  useEffect(() => {
    if (selectedCity?.name) {
      setQuery(selectedCity.name);
      return;
    }
    setQuery("");
  }, [selectedCity]);

  const matches = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return [];

    return [...cities]
      .filter((city) => city.name.toLowerCase().startsWith(term))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [cities, query]);

  const cityOptions = useMemo(
    () => [...cities].sort((left, right) => left.name.localeCompare(right.name)),
    [cities],
  );

  const historyCities = useMemo(
    () => history.map((id) => cities.find((city) => city.id === id)).filter(Boolean),
    [history, cities],
  );

  function updateHistory(cityId) {
    setHistory((prev) => {
      const next = [cityId, ...prev.filter((id) => id !== cityId)].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  function handleSelect(cityId) {
    const city = cities.find((entry) => entry.id === cityId);
    if (!city) return;

    onSelectCity(city.id);
    updateHistory(city.id);
    setQuery(city.name);
    setOpen(false);
  }

  function handleEnterSelection(event) {
    if (event.key !== "Enter") return;
    const bestMatch = matches[0];
    if (!bestMatch) return;

    event.preventDefault();
    handleSelect(bestMatch.id);
  }

  return (
    <section className="border border-slate-300 bg-white shadow-[0_18px_35px_-30px_rgba(27,54,93,0.9)] transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-slate-100 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950/40">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">City Registry</p>
            <h2 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Search and select a monitored city</h2>
          </div>
          <span className="border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {cities.length} cities online
          </span>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
          <label className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="uppercase tracking-wide text-[11px] text-slate-500 dark:text-slate-400">Quick city dropdown</span>
            <select
              aria-label="Select city from full registry"
              value={selectedCity?.id || ""}
              onChange={(event) => {
                if (event.target.value) handleSelect(event.target.value);
              }}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select city</option>
              {cityOptions.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} ({city.state})
                </option>
              ))}
            </select>
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search Indian cities"
              aria-expanded={open}
              aria-autocomplete="list"
              value={query}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onKeyDown={handleEnterSelection}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              placeholder={selectedCity ? `Selected: ${selectedCity.name}` : "Type the first letters of a city name"}
              className="w-full border border-slate-300 bg-slate-50 px-10 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition duration-200 focus:border-brand-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setOpen((prev) => !prev)}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-content-center border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle suggestions"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {query ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery("");
                  setOpen(true);
                }}
                className="absolute right-10 top-1/2 grid h-6 w-6 -translate-y-1/2 place-content-center border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}

            {open && (
              <motion.ul
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {query.trim() ? (
                  matches.length > 0 ? (
                    matches.slice(0, 12).map((city) => (
                      <li key={city.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelect(city.id)}
                          className={`w-full px-4 py-2.5 text-left text-sm transition ${
                            selectedCity?.id === city.id
                              ? "border-l-4 border-brand-700 bg-brand-50 font-semibold text-brand-700 dark:border-brand-500 dark:bg-slate-800 dark:text-brand-200"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold">{city.name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{city.state}</p>
                            </div>
                            <span className="text-[11px] text-slate-400">Starts with query</span>
                          </div>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No city names start with "{query.trim()}".</li>
                  )
                ) : historyCities.length > 0 ? (
                  historyCities.map((city) => (
                    <li key={city.id}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(city.id)}
                        className={`w-full px-4 py-2.5 text-left text-sm transition ${
                          selectedCity?.id === city.id
                            ? "border-l-4 border-brand-700 bg-brand-50 font-semibold text-brand-700 dark:border-brand-500 dark:bg-slate-800 dark:text-brand-200"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{city.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">Recent</span>
                        </div>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No search history yet</li>
                )}
              </motion.ul>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {selectedCity
            ? `Selected city: ${selectedCity.name}, ${selectedCity.state}`
            : "Start typing to filter the registry and load a city-specific view."}
        </p>
      </div>
    </section>
  );
}
