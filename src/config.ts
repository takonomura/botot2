import * as moment from "moment"
import * as Misskey from "./misskey"
import { Database } from "./modules/markov-speaking/database"

type Duration = {
	value: number
	unit: moment.unitOfTime.Base
}
type LengthRange = {
	start: number
	end: number
}

type Config = {
	i: string
	host: string
	headers?: { [key: string]: string }
	baseURL?: string
	wsURL?: string
	apiURL?: string
	streamURL?: string
	connectionTimeout?: number
	timeline: Misskey.Timeline
	timelineChannel: Misskey.Channel
	intervalPost: boolean
	intervalPostDuration: Duration
	postMaxCharacterCount: number
	modules: [string]
	markovSpeaking: {
		allowLearn: boolean
		allowLearnCW: boolean
		allowLearnVisFollowers: boolean
		/*
		 * If you want this bot not to learn the message
		 * from a specified account, you can add an account
		 * into this list to prevent from learning their posts.
		 */
		blocked: [string]
		filtering: boolean
		wordFilterURL: string
		wordFilterFiles: [string]
		wordFilterLog: boolean
	}
	math: {
		size: number
	}
	op: [string]
	database: {
		path: string
		type: Database
		saveFrequency: number
		saveDuration: Duration

		maxSize: number
		attenuationRate: number
	}
	sentenceLengthRange: LengthRange
	mecab: {
		commandOptions?: string
	}
	visibility: Misskey.Visibility
	cwStart: number

	version: string
	revision: string
	delay: number
}

const config = require("../config.json")
const meta = require("./meta.json")

config.baseURL = `https://${config.host}`
config.wsURL = `wss://${config.host}`
config.apiURL = `${config.baseURL}/api`
config.streamURL = `${config.wsURL}/streaming?i=${config.i}`
config.version = meta.version
config.revision = meta.revision

function getTimelineURL(config: Config) {
	switch (config.timeline) {
		case "home":
			return `${config.wsURL}/?i=${config.i}`
		case "local":
			return `${config.wsURL}/local-timeline?i=${config.i}`
		case "social":
		case "hybrid":
			return `${config.wsURL}/hybrid-timeline?i=${config.i}`
		case "global":
			return `${config.wsURL}/global-timeline?i=${config.i}`
		default:
			console.warn("Timeline not specified correctly, using home...")
			return `${config.wsURL}/?i=${config.i}`
	}
}

function getProperTimelineProperty(config: Config) {
	switch (config.timeline) {
		case "home":
		case "local":
		case "global":
		case "hybrid":
			return `${config.timeline}Timeline`
		case "social":
			console.warn(
				"specifying 'social' as a timeline is deprecated. using hybridTimeline."
			)
			return "hybridTimeline"
		default:
			console.warn("Timeline not specified correctly, using home...")
			return "homeTimeline"
	}
}
config.timelineChannel = getProperTimelineProperty(config)

function getProperVisibilityProperty(config: Config) {
	switch (config.visibility) {
		case "followers":
		case "home":
		case "private":
		case "public":
		case "specified":
			return config.visibility
		default:
			console.warn("Visibility not specified correctly, using home...")
			return "home"
	}
}
config.visibility = getProperVisibilityProperty(config)

// * Backward compatibility
if (config.database.attenuationRate == undefined)
	config.database.attenuationRate = 0

if (config.markov.allowLearnVisFollowers == undefined)
	config.markov.allowLearnVisFollowers = true

export default config as Config
