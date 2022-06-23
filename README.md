# Dungeon & Dragons 5e scrap

This repository contains D&D 5e scraped data.

## Data structure

Output objects should respect a few rules.

- All objects must have an `id` which is a string that uniqely identify a document
- Localised strings (eg. weapon name) are records which maps locale to string value

```json
{
  "name": {
    "fr": "Dague",
    "en": "Dagger"
  }
}
```

- Prices are stored as gp and the lower possible value if not `0` is `0.01` (1 cp)
- Weights are stored as a record of `kg` and `lb`. Although there is a common ratio of `1kg:2lb` this is not always respected

```json
{
  "weight": {
    "lb": 0.25,
    "kg": 0.1
  }
}
```

- Distances are stored as a record of `feet` and `meters`

```json
{
  "range": {
    "feet": 5,
    "meters": 1.5
  }
}
```

- Things that involve rolling dices are stored as `formula`

```
1d4
1d10 + 4
2d12 + 1d8
```

- Damage is stored as a record of `formula` and `type`

```json
{
  "damage": {
    "formula": "1d8",
    "type": "piercing"
  }
}
```

- Objets must include a `source` attribute (see `json/sources.json`)

### Collections

- `weapons.json` all weapons

### Output

There is currently a single output format :

- `json/` contains scrapped data as json format
