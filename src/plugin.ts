import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { CpuUsage } from "./actions/cpu-usage";

streamDeck.logger.setLevel(LogLevel.ERROR);

// Register the CPU usage action.
streamDeck.actions.registerAction(new CpuUsage());

// Finally, connect to the Stream Deck.
streamDeck.connect();
