import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

const HISTORY_KEY = "psas-city-search-history";
const MAX_HISTORY = 8;

export default function CitySelector({ cities, selectedCityId, onSelectCity }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);

  const selectedCity = cities.find((city) => city.id === selectedCityId) || null;

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

  const matches = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return [];
    return [...cities]
      .filter((city) => city.name.toLowerCase().includes(term) || city.state.toLowerCase().includes(term))
      .sort((left, right) => {
        const leftName = left.name.toLowerCase();
        const rightName = right.name.toLowerCase();
        const leftStarts = leftName.startsWith(term) ? 0 : 1;
        const rightStarts = rightName.startsWith(term) ? 0 : 1;
        if (leftStarts !== rightStarts) return leftStarts - rightStarts;
        return leftName.localeCompare(rightName);
      });
  }, [cities, query]);

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
    if (city) {
      onSelectCity(city.id);
      updateHistory(city.id);
      setQuery(city.name);
      setOpen(false);
    }
  }

  function handleEnterSelection(event) {
    if (event.key !== "Enter") return;
    const bestMatch = matches[0];
    if (bestMatch) {
      event.preventDefault();
      handleSelect(bestMatch.id);
    }
  }

  return (
    <section className="border border-slate-300 bg-white p-3 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2">
        <div className="mb-2 flex items-end justify-between gap-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Select City to Begin</label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{cities.length} cities available</span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Search Indian cities"
            aria-expanded={open}
            value={query}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={handleEnterSelection}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            placeholder={selectedCity ? `Selected: ${selectedCity.name}` : "Search Indian cities..."}
            className="w-full border border-slate-300 bg-slate-50 px-10 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition duration-200 focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {query ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setQuery("");
                setOpen(true);
              }}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-content-center border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
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
              className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {query.trim() ? (
                matches.length > 0 ? (
                  matches.slice(0, 10).map((city) => (
                    <li key={city.id}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(city.id)}
                        className={`w-full px-4 py-3 text-left text-sm transition ${
                          selectedCity?.id === city.id
                            ? "border-l-4 border-brand-700 bg-brand-50 font-semibold text-brand-700 dark:border-brand-500 dark:bg-slate-800 dark:text-brand-200"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{city.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{city.state}</span>
                        </div>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No cities found</li>
                )
              ) : historyCities.length > 0 ? (
                historyCities.map((city) => (
                  <li key={city.id}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelect(city.id)}
                      className={`w-full px-4 py-3 text-left text-sm transition ${
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
          : "Start typing to filter the dropdown and load a city-specific view."}
      </p>
    </section>
  );
}
