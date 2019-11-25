import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createVocab, deleteVocab, getVocabs, patchVocab } from '../api/vocabs-api'
import Auth from '../auth/Auth'
import { Vocab } from '../types/Vocab'

interface VocabsProps {
  auth: Auth
  history: History
}

interface VocabsState {
  vocabs: Vocab[]
  newVocabName: string
  loadingVocabs: boolean
}

export class Vocabs extends React.PureComponent<VocabsProps, VocabsState> {
  state: VocabsState = {
    vocabs: [],
    newVocabName: '',
    loadingVocabs: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newVocabName: event.target.value })
  }

  onEditButtonClick = (vocabId: string) => {
    this.props.history.push(`/vocabs/${vocabId}/edit`)
  }

  onVocabCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newVocab = await createVocab(this.props.auth.getIdToken(), {
        name: this.state.newVocabName,
        dueDate
      })
      this.setState({
        vocabs: [...this.state.vocabs, newVocab],
        newVocabName: ''
      })
    } catch {
      alert('Vocab creation failed')
    }
  }

  onVocabDelete = async (vocabId: string) => {
    try {
      await deleteVocab(this.props.auth.getIdToken(), vocabId)
      this.setState({
        vocabs: this.state.vocabs.filter(vocab => vocab.vocabId != vocabId)
      })
    } catch {
      alert('Vocab deletion failed')
    }
  }

  onVocabCheck = async (pos: number) => {
    try {
      const vocab = this.state.vocabs[pos]
      await patchVocab(this.props.auth.getIdToken(), vocab.vocabId, {
        name: vocab.name,
        dueDate: vocab.dueDate,
        done: !vocab.done
      })
      this.setState({
        vocabs: update(this.state.vocabs, {
          [pos]: { done: { $set: !vocab.done } }
        })
      })
    } catch {
      alert('Vocab deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const vocabs = await getVocabs(this.props.auth.getIdToken())
      this.setState({
        vocabs,
        loadingVocabs: false
      })
    } catch (e) {
      alert(`Failed to fetch vocabs: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Visual Vocab</Header>
        <Header as="h4">Add a word and edit to add accompanying photo</Header>

        {this.renderCreateVocabInput()}

        {this.renderVocabs()}
      </div>
    )
  }

  renderCreateVocabInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Add new word',
              onClick: this.onVocabCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderVocabs() {
    if (this.state.loadingVocabs) {
      return this.renderLoading()
    }

    return this.renderVocabsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Visual Vocab
        </Loader>
      </Grid.Row>
    )
  }

  renderVocabsList() {
    return (
      <Grid padded>
        {this.state.vocabs.map((vocab, pos) => {
          return (
            <Grid.Row key={vocab.vocabId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onVocabCheck(pos)}
                  checked={vocab.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {vocab.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {vocab.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(vocab.vocabId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onVocabDelete(vocab.vocabId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {vocab.attachmentUrl && (
                <Image src={vocab.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
