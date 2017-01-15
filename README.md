# SPARCS nugu

- Slack Bot
- Homepage
- Command line

## Installation

### Command

Add the following as `/SPARCS/bin/nugu`

```bash
#! /bin/bash
source $NUGU_VENV/bin/activate
exec python -m nugu.cli $@
```

### Slack bot using supervisord

Add the following as `/etc/supervisor/conf.d/nugu.conf`.

```dosini
[app:nugu]
command=/SPARCS/nugu/run_bot.sh
directory=/SPARCS/nugu
stopasgroup=true
killasgroup=true
```

## Developers

- samjo (조성원)
- netj (신재호)
- daybreaker (김준기)
